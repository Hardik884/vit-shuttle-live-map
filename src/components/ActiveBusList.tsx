import type { Bus } from "./ShuttleMap";

interface ActiveBusListProps {
  buses: Bus[];
  selectedBusId: string | null;
  onSelectBus: (bus: Bus) => void;
}

const ActiveBusList = ({ buses, selectedBusId, onSelectBus }: ActiveBusListProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-semibold">Active Buses</h3>
        <span className="text-xs text-muted-foreground">({buses.length} on route)</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {buses.map((bus) => {
          const occupancy = Math.round((bus.occupancy / bus.capacity) * 100);
          const isSelected = bus.id === selectedBusId;
          const occColor =
            occupancy > 85 ? "text-status-danger" : occupancy > 60 ? "text-status-warning" : "text-status-live";

          return (
            <button
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={`flex flex-col items-center py-3 px-2 rounded-lg border transition-all text-center ${
                isSelected
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-secondary hover:bg-accent"
              }`}
            >
              <span className="text-sm font-semibold">{bus.name}</span>
              <span className={`text-[11px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {bus.eta} min
              </span>
              <span className={`text-[11px] font-mono-track font-medium ${isSelected ? "text-primary-foreground/80" : occColor}`}>
                {occupancy}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveBusList;
