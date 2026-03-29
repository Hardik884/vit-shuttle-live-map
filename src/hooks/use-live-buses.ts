import { useEffect, useMemo, useState } from "react";
import type { Bus } from "@/components/ShuttleMap";

const BUSES_API_URL = "https://embedded-vit-gps-tracking.onrender.com/buses";
const ETA_API_URL = "https://13.206.65.251.nip.io/predict";
const DEFAULT_POLL_INTERVAL_MS = 10000;

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

// Call this whenever fresh GPS coordinates are received from the live buses API.
const fetchETA = async (lat: number, lon: number): Promise<EtaResponse | null> => {
  try {
    const res = await fetch(ETA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });

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

  useEffect(() => {
    let isMounted = true;

    const fetchBuses = async () => {
      try {
        const response = await fetch(BUSES_API_URL);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ApiResponse;
        if (!data?.buses?.length) {
          return;
        }

        const validBuses = data.buses.filter((bus) => isValidCoordinate(bus.lat, bus.lon));

        const mappedBuses = await Promise.all(
          validBuses.map(async (bus, index) => {
            const etaData = await fetchETA(bus.lat, bus.lon);
            return mapGpsToBus(bus, index, etaData);
          })
        );

        if (!mappedBuses.length || !isMounted) {
          return;
        }

        setBuses(mappedBuses);
        setIsUsingLiveData(true);
      } catch {
        // Keep current data when API is temporarily unavailable.
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
  };
}
