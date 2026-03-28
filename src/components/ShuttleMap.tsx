import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// VIT Vellore campus center
const VIT_CENTER: [number, number] = [12.9692, 79.1559];

// VIT campus shuttle stops
const STOPS: { name: string; position: [number, number]; waiting: number }[] = [
  { name: "Main Gate", position: [12.9710, 79.1555], waiting: 12 },
  { name: "Men's Hostel", position: [12.9720, 79.1590], waiting: 24 },
  { name: "Technology Tower", position: [12.9685, 79.1600], waiting: 8 },
  { name: "SJT", position: [12.9695, 79.1530], waiting: 15 },
  { name: "GDN", position: [12.9665, 79.1560], waiting: 5 },
];

// Shuttle route polyline
const ROUTE_PATH: [number, number][] = [
  STOPS[0].position,
  STOPS[1].position,
  STOPS[2].position,
  STOPS[4].position,
  STOPS[3].position,
  STOPS[0].position,
];

interface Bus {
  id: string;
  name: string;
  route: string;
  position: [number, number];
  occupancy: number;
  capacity: number;
  speed: number;
  driver: string;
  eta: number;
}

const MOCK_BUSES: Bus[] = [
  { id: "n1", name: "N1", route: "North Loop", position: [12.9712, 79.1568], occupancy: 43, capacity: 60, speed: 12, driver: "Rajesh Kumar", eta: 0 },
  { id: "n2", name: "N2", route: "North Loop", position: [12.9700, 79.1580], occupancy: 27, capacity: 60, speed: 18, driver: "Suresh Babu", eta: 4 },
  { id: "e1", name: "E1", route: "East Ring", position: [12.9688, 79.1605], occupancy: 44, capacity: 60, speed: 0, driver: "Arun Prasad", eta: 0 },
  { id: "w1", name: "W1", route: "West Circuit", position: [12.9690, 79.1525], occupancy: 52, capacity: 60, speed: 8, driver: "Vijay Nair", eta: 2 },
  { id: "s1", name: "S1", route: "South Express", position: [12.9660, 79.1555], occupancy: 52, capacity: 60, speed: 15, driver: "Karthik Rajan", eta: 6 },
];

const createStopIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:hsl(0,0%,7%);border:2px solid hsl(0,0%,100%);box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

const createBusIcon = (name: string, isSelected = false) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${isSelected ? "hsl(142,70%,30%)" : "hsl(0,0%,7%)"};color:white;font-size:10px;font-weight:600;font-family:'Space Grotesk',sans-serif;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span>${name}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

function AnimateBuses({ buses, onSelectBus, selectedBusId }: { buses: Bus[]; onSelectBus: (bus: Bus) => void; selectedBusId: string | null }) {
  return (
    <>
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={bus.position}
          icon={createBusIcon(bus.name, bus.id === selectedBusId)}
          eventHandlers={{ click: () => onSelectBus(bus) }}
        >
          <Popup className="leaflet-popup-custom">
            <div className="font-sans text-xs">
              <strong>{bus.name}</strong> · {bus.route}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface ShuttleMapProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
  selectedBusId: string | null;
}

const ShuttleMap = ({ buses, onSelectBus, selectedBusId }: ShuttleMapProps) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={VIT_CENTER}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline
          positions={ROUTE_PATH}
          pathOptions={{ color: "hsl(0,0%,7%)", weight: 2, opacity: 0.3, dashArray: "6 4" }}
        />
        {STOPS.map((stop) => (
          <Marker key={stop.name} position={stop.position} icon={createStopIcon()}>
            <Popup>
              <div className="font-sans text-xs">
                <strong>{stop.name}</strong>
                <br />
                {stop.waiting} waiting
              </div>
            </Popup>
          </Marker>
        ))}
        <AnimateBuses buses={buses} onSelectBus={onSelectBus} selectedBusId={selectedBusId} />
      </MapContainer>
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border text-[11px] text-muted-foreground">
        VIT Vellore Campus · Live
      </div>
    </div>
  );
};

export { MOCK_BUSES };
export type { Bus };
export default ShuttleMap;
