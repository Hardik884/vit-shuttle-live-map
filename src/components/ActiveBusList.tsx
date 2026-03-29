import type { Bus } from "./ShuttleMap";

interface ActiveBusListProps {
  buses: Bus[];
  selectedBusId: string | null;
  onSelectBus: (bus: Bus) => void;
}

const ActiveBusList = ({ buses, selectedBusId, onSelectBus }: ActiveBusListProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-semibold">Active Buses</h3>
        <span className="text-xs text-muted-foreground">({buses.length} on route)</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId;
          return (
            <button
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={`flex flex-col items-center py-2.5 sm:py-3 px-2 rounded-lg border transition-all text-center ${
                isSelected
                  ? "border-foreground bg-primary text-primary-foreground"
                  : bus.isOffline
                  ? "border-border bg-secondary/50 opacity-60"
                  : "border-border bg-secondary hover:bg-accent"
              }`}
            >
              <span className="text-xs sm:text-sm font-semibold">{bus.name}</span>
              <span className={`text-[10px] sm:text-[11px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {bus.isOffline ? "Offline" : `${bus.eta} min`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveBusList;
