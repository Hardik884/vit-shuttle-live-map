import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ShuttleMap from "@/components/ShuttleMap";
import BusInfoPanel from "@/components/BusInfoPanel";
import ActiveBusList from "@/components/ActiveBusList";
import { MOCK_BUSES } from "@/components/ShuttleMap";
import type { Bus } from "@/components/ShuttleMap";

const Index = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(MOCK_BUSES[0]);

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader liveBusCount={MOCK_BUSES.length} notificationCount={2} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 h-[500px] lg:h-[580px]">
            <ShuttleMap
              onSelectBus={handleSelectBus}
              selectedBusId={selectedBus?.id ?? null}
            />
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 overflow-y-auto max-h-[580px]">
            <BusInfoPanel bus={selectedBus} />
          </div>
        </div>

        {/* Active Buses */}
        <ActiveBusList
          buses={MOCK_BUSES}
          selectedBusId={selectedBus?.id ?? null}
          onSelectBus={handleSelectBus}
        />
      </main>
    </div>
  );
};

export default Index;
