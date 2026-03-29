import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ShuttleMap, { STOPS } from "@/components/ShuttleMap";
import BusInfoPanel from "@/components/BusInfoPanel";
import ActiveBusList from "@/components/ActiveBusList";
import type { Bus } from "@/components/ShuttleMap";
import { useLiveBuses } from "@/hooks/use-live-buses";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { buses, busIds, isInitialLoading } = useLiveBuses();
  const onlineBusCount = buses.filter((bus) => bus.connectionStatus === "online").length;
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
      <DashboardHeader liveBusCount={onlineBusCount} />
      
      <main className="w-full px-3 sm:px-6 lg:px-10 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {isInitialLoading ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 h-[45vh] sm:h-[55vh] lg:h-[75vh] bg-card rounded-xl border border-border p-4">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
              <div className="lg:col-span-1 max-h-[50vh] lg:max-h-[75vh] bg-card rounded-xl border border-border p-4 space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 sm:h-16 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Map */}
              <div className="lg:col-span-2 h-[45vh] sm:h-[55vh] lg:h-[75vh]">
                <ShuttleMap
                  buses={buses}
                  onSelectBus={handleSelectBus}
                  selectedBusId={safeSelectedBusId}
                  userLocation={userLocation}
                />
              </div>

              {/* Info Panel */}
              <div className="lg:col-span-1 overflow-y-auto max-h-[50vh] lg:max-h-[75vh]">
                <BusInfoPanel bus={selectedBus} timeToNearestStopMinutes={timeToNearestStopMinutes} hasUserLocation={Boolean(userLocation)} />
              </div>
            </div>

            {/* Active Buses */}
            <ActiveBusList
              buses={buses}
              selectedBusId={safeSelectedBusId}
              onSelectBus={handleSelectBus}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
