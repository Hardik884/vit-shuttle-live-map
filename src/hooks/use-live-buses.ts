import { useEffect, useMemo, useState } from "react";
import { MOCK_BUSES } from "@/components/ShuttleMap";
import type { Bus } from "@/components/ShuttleMap";

const BUSES_API_URL = "https://embedded-vit-gps-tracking.onrender.com/buses";
const DEFAULT_POLL_INTERVAL_MS = 10000;

interface ApiBus {
  bus_id: string;
  lat: number;
  lon: number;
  status?: string;
}

interface ApiResponse {
  buses: ApiBus[];
}

const isValidCoordinate = (lat: number, lon: number) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

const formatBusName = (busId: string) => {
  const compact = busId.replace(/^BUS_/i, "");
  return compact || busId;
};

const mapGpsToBus = (apiBus: ApiBus, index: number): Bus => {
  const fallback = MOCK_BUSES[index % MOCK_BUSES.length];
  const isNoData = apiBus.status?.toUpperCase() === "NO_DATA";

  return {
    ...fallback,
    id: apiBus.bus_id,
    name: formatBusName(apiBus.bus_id),
    position: [apiBus.lat, apiBus.lon],
    speed: isNoData ? 0 : fallback.speed,
    eta: isNoData ? 0 : fallback.eta,
  };
};

interface UseLiveBusesOptions {
  pollIntervalMs?: number;
}

export function useLiveBuses(options: UseLiveBusesOptions = {}) {
  const { pollIntervalMs = DEFAULT_POLL_INTERVAL_MS } = options;
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
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

        const mappedBuses = data.buses
          .filter((bus) => isValidCoordinate(bus.lat, bus.lon))
          .map((bus, index) => mapGpsToBus(bus, index));

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
