import { MapPin, Gauge, User, Clock } from "lucide-react";
import type { Bus } from "./ShuttleMap";

interface BusInfoPanelProps {
  bus: Bus | null;
}

const BusInfoPanel = ({ bus }: BusInfoPanelProps) => {
  if (!bus) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center text-center min-h-[300px] animate-slide-up">
        <MapPin className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Select a bus on the map</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Click any shuttle to view details</p>
      </div>
    );
  }

  const occupancyPercent = Math.round((bus.occupancy / bus.capacity) * 100);
  const occupancyColor =
    occupancyPercent > 85 ? "bg-status-danger" : occupancyPercent > 60 ? "bg-status-warning" : "bg-status-live";
  const occupancyLabel =
    occupancyPercent > 85 ? "Crowded" : occupancyPercent > 60 ? "Moderate" : "Available";

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Bus header */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Bus {bus.name}</h2>
            <p className="text-xs text-muted-foreground">{bus.route}</p>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-live/10 border border-status-live/30 text-[11px] font-medium text-status-live">
            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
            On Route
          </span>
        </div>

        {/* ETA */}
        <div className="bg-surface-sunken rounded-lg p-4 text-center mb-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Estimated Arrival</p>
          <p className="font-mono-track text-3xl font-bold">{bus.eta}</p>
          <p className="text-xs text-muted-foreground">min</p>
        </div>

        {/* Occupancy */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium">Occupancy</span>
            <span className="text-xs font-mono-track font-medium">{bus.occupancy} / {bus.capacity}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${occupancyColor}`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">{occupancyPercent}% full</span>
            <span className={`text-[11px] font-medium ${occupancyPercent > 85 ? "text-status-danger" : occupancyPercent > 60 ? "text-status-warning" : "text-status-live"}`}>
              {occupancyLabel}
            </span>
          </div>
        </div>

        {/* Driver & Speed */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Driver</p>
            <p className="font-medium truncate">{bus.driver}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Speed</p>
            <p className="font-mono-track font-medium">{bus.speed > 0 ? `${bus.speed} km/h` : "Stopped"}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Book This Bus
        </button>
        <button className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors">
          View Full Details
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
        <div className="space-y-2.5">
          {[
            { label: "Average Speed", value: `${bus.speed} km/h`, icon: Gauge },
            { label: "Distance to Stop", value: "0.8 km", icon: MapPin },
            { label: "GPS Accuracy", value: "±3 m", icon: MapPin, accent: true },
            { label: "Last Updated", value: "Just now", icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className={`font-mono-track font-medium ${stat.accent ? "text-status-live" : ""}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusInfoPanel;
