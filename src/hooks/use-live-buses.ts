import { useEffect, useMemo, useRef, useState } from "react";
import type { Bus } from "@/components/ShuttleMap";

const BUSES_API_URL = "https://embedded-vit-gps-tracking.onrender.com/buses";
const ETA_API_URL = "https://13.206.65.251.nip.io/predict";
const DEFAULT_POLL_INTERVAL_MS = 10000;
const BUSES_FETCH_TIMEOUT_MS = 4500;
const ETA_FETCH_TIMEOUT_MS = 1800;

interface ApiBus {
  bus_id: string;
  lat: number;
  lon: number;
  speed?: number;
  status?: string;
}

interface ApiResponse {
  buses: ApiBus[];
}

interface EtaResponse {
  eta_minutes?: number;
  next_stop?: string;
  current_stop?: string;
  is_peak_hour?: boolean;
}

interface FallbackBusDetails {
  route: string;
  occupancy: number;
  capacity: number;
  speed: number;
  driver: string;
  eta: number;
}

const FALLBACK_BUS_DETAILS: FallbackBusDetails[] = [
  { route: "North Loop", occupancy: 43, capacity: 60, speed: 12, driver: "Rajesh Kumar", eta: 0 },
  { route: "North Loop", occupancy: 27, capacity: 60, speed: 18, driver: "Suresh Babu", eta: 4 },
  { route: "East Ring", occupancy: 44, capacity: 60, speed: 0, driver: "Arun Prasad", eta: 0 },
  { route: "West Circuit", occupancy: 52, capacity: 60, speed: 8, driver: "Vijay Nair", eta: 2 },
  { route: "South Express", occupancy: 52, capacity: 60, speed: 15, driver: "Karthik Rajan", eta: 6 },
];

const isValidCoordinate = (lat: number, lon: number) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

const formatBusName = (busId: string) => {
  const compact = busId.replace(/^BUS_/i, "");
  return compact || busId;
};

const normalizeConnectionStatus = (status?: string): "online" | "offline" => {
  const normalized = status?.trim().toLowerCase();
  if (normalized === "offline" || normalized === "no_data" || normalized === "no data") {
    return "offline";
  }
  return "online";
};

const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

// Call this whenever fresh GPS coordinates are received from the live buses API.
const fetchETA = async (lat: number, lon: number): Promise<EtaResponse | null> => {
  try {
    const res = await fetchWithTimeout(
      ETA_API_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      },
      ETA_FETCH_TIMEOUT_MS
    );

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as EtaResponse;
    return data;
  } catch (err) {
    console.error("ETA fetch failed:", err);
    return null;
  }
};

const mapGpsToBus = (apiBus: ApiBus, index: number, etaData: EtaResponse | null): Bus => {
  const fallback = FALLBACK_BUS_DETAILS[index % FALLBACK_BUS_DETAILS.length];
  const connectionStatus = normalizeConnectionStatus(apiBus.status);
  const isOffline = connectionStatus === "offline";
  const apiSpeed = Number.isFinite(apiBus.speed) ? Number(apiBus.speed) : null;
  const etaFromApi = Number.isFinite(etaData?.eta_minutes) ? Number(etaData?.eta_minutes) : null;

  return {
    id: apiBus.bus_id,
    name: formatBusName(apiBus.bus_id),
    route: fallback.route,
    position: [apiBus.lat, apiBus.lon],
    occupancy: fallback.occupancy,
    capacity: fallback.capacity,
    speed: isOffline ? 0 : apiSpeed ?? fallback.speed,
    driver: fallback.driver,
    eta: isOffline ? 0 : etaFromApi ?? fallback.eta,
    connectionStatus,
  };
};

interface UseLiveBusesOptions {
  pollIntervalMs?: number;
}

export function useLiveBuses(options: UseLiveBusesOptions = {}) {
  const { pollIntervalMs = DEFAULT_POLL_INTERVAL_MS } = options;
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const fetchBuses = async () => {
      const requestId = ++latestRequestIdRef.current;

      try {
        const response = await fetchWithTimeout(BUSES_API_URL, {}, BUSES_FETCH_TIMEOUT_MS);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ApiResponse;
        if (!data?.buses?.length) {
          return;
        }

        const validBuses = data.buses.filter((bus) => isValidCoordinate(bus.lat, bus.lon));
        const quickMappedBuses = validBuses.map((bus, index) => mapGpsToBus(bus, index, null));

        if (!quickMappedBuses.length || !isMounted || requestId !== latestRequestIdRef.current) {
          return;
        }

        // Render quickly with GPS data first, then enrich ETAs in the background.
        setBuses(quickMappedBuses);
        setIsUsingLiveData(true);

        const busesWithEta = await Promise.all(
          validBuses.map(async (bus, index) => {
            const baseBus = quickMappedBuses[index];
            if (!baseBus || baseBus.connectionStatus === "offline") {
              return baseBus;
            }

            const etaData = await fetchETA(bus.lat, bus.lon);
            const etaMinutes = Number.isFinite(etaData?.eta_minutes) ? Number(etaData?.eta_minutes) : null;

            if (etaMinutes === null) {
              return baseBus;
            }

            return {
              ...baseBus,
              eta: etaMinutes,
            };
          })
        );

        if (!isMounted || requestId !== latestRequestIdRef.current) {
          return;
        }

        setBuses(busesWithEta.filter(Boolean) as Bus[]);
      } catch {
        // Keep current data when API is temporarily unavailable.
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  const busIds = useMemo(() => new Set(buses.map((bus) => bus.id)), [buses]);

  return {
    buses,
    busIds,
    isUsingLiveData,
    isInitialLoading,
  };
}
