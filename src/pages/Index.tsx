import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ShuttleMap, { STOPS } from "@/components/ShuttleMap";
import BusInfoPanel from "@/components/BusInfoPanel";
import ActiveBusList from "@/components/ActiveBusList";
import type { Bus } from "@/components/ShuttleMap";
import { useLiveBuses } from "@/hooks/use-live-buses";

const AVERAGE_WALKING_SPEED_KMPH = 5;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const getDistanceKm = (from: [number, number], to: [number, number]) => {
  const earthRadiusKm = 6371;
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const Index = () => {
  const { buses, busIds } = useLiveBuses();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // User denied location or location lookup failed.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const safeSelectedBusId = selectedBusId && busIds.has(selectedBusId) ? selectedBusId : buses[0]?.id ?? null;

  const selectedBus = useMemo(
    () => buses.find((bus) => bus.id === safeSelectedBusId) ?? null,
    [buses, safeSelectedBusId]
  );

  const timeToNearestStopMinutes = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    const nearestStopDistanceKm = STOPS.reduce((nearestDistance, stop) => {
      const distance = getDistanceKm(userLocation, stop.position);
      return Math.min(nearestDistance, distance);
    }, Number.POSITIVE_INFINITY);

    if (!Number.isFinite(nearestStopDistanceKm)) {
      return null;
    }

    const minutes = (nearestStopDistanceKm / AVERAGE_WALKING_SPEED_KMPH) * 60;
    return Number.isFinite(minutes) ? Math.max(1, Math.round(minutes)) : null;
  }, [userLocation]);

  const handleSelectBus = (bus: Bus) => {
    setSelectedBusId(bus.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader liveBusCount={buses.length} />
      
      <main className="w-full px-4 sm:px-6 lg:px-10 py-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 h-[60vh] lg:h-[75vh]">
            <ShuttleMap
              buses={buses}
              onSelectBus={handleSelectBus}
              selectedBusId={safeSelectedBusId}
              userLocation={userLocation}
            />
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 overflow-y-auto max-h-[60vh] lg:max-h-[75vh]">
            <BusInfoPanel bus={selectedBus} timeToNearestStopMinutes={timeToNearestStopMinutes} hasUserLocation={Boolean(userLocation)} />
          </div>
        </div>

        {/* Active Buses */}
        <ActiveBusList
          buses={buses}
          selectedBusId={safeSelectedBusId}
          onSelectBus={handleSelectBus}
        />
      </main>
    </div>
  );
};

export default Index;
