import { useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ShuttleMap from "@/components/ShuttleMap";
import BusInfoPanel from "@/components/BusInfoPanel";
import ActiveBusList from "@/components/ActiveBusList";
import { MOCK_BUSES } from "@/components/ShuttleMap";
import type { Bus } from "@/components/ShuttleMap";
import { useLiveBuses } from "@/hooks/use-live-buses";

const Index = () => {
  const { buses, busIds } = useLiveBuses();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(MOCK_BUSES[0]?.id ?? null);

  const safeSelectedBusId = selectedBusId && busIds.has(selectedBusId) ? selectedBusId : buses[0]?.id ?? null;

  const selectedBus = useMemo(
    () => buses.find((bus) => bus.id === safeSelectedBusId) ?? null,
    [buses, safeSelectedBusId]
  );

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
            />
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 overflow-y-auto max-h-[60vh] lg:max-h-[75vh]">
            <BusInfoPanel bus={selectedBus} />
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
