import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// VIT Vellore campus center
const VIT_CENTER: [number, number] = [12.9700, 79.1610];

// VIT campus shuttle stops
const STOPS: { name: string; position: [number, number]; waiting: number }[] = [
  { name: "Architecture Block", position: [12.972676, 79.167124], waiting: 8 },
  { name: "PRP", position: [12.97228, 79.165859], waiting: 14 },
  { name: "SJT", position: [12.971728, 79.163482], waiting: 20 },
  { name: "LH-E/F", position: [12.971534, 79.162317], waiting: 6 },
  { name: "LH-C/D", position: [12.971346, 79.160748], waiting: 10 },
  { name: "TT", position: [12.970791, 79.158697], waiting: 15 },
  { name: "FoodCourt", position: [12.969833, 79.158697], waiting: 18 },
  { name: "Foodys Circle/SMV", position: [12.969718, 79.158206], waiting: 7 },
  { name: "Anna Auditorium", position: [12.969677, 79.155954], waiting: 12 },
  { name: "GDN/CDMM", position: [12.96934, 79.155302], waiting: 5 },
  { name: "Main Gate", position: [12.968483, 79.156078], waiting: 22 },
  { name: "Main Building", position: [12.96885, 79.155936], waiting: 9 },
  { name: "Library", position: [12.96881, 79.156874], waiting: 11 },
];

// Shuttle route polyline (connecting all stops in order, looping back)
const ROUTE_PATH: [number, number][] = STOPS.map(s => s.position).concat([STOPS[0].position]);

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

const createUserIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:hsl(212,100%,45%);border:2px solid hsl(0,0%,100%);box-shadow:0 0 0 4px rgba(59,130,246,0.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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
  userLocation: [number, number] | null;
}

const ShuttleMap = ({ buses, onSelectBus, selectedBusId, userLocation }: ShuttleMapProps) => {
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
        {STOPS.map((stop) => (
          <Marker key={stop.name} position={stop.position} icon={createStopIcon()}>
            <Popup>
              <div className="font-sans text-xs">
                <strong>{stop.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="font-sans text-xs">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        <AnimateBuses buses={buses} onSelectBus={onSelectBus} selectedBusId={selectedBusId} />
      </MapContainer>
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border text-[11px] text-muted-foreground">
        VIT Vellore Campus · Live
      </div>
    </div>
  );
};

export type { Bus };
export { STOPS };
export default ShuttleMap;
