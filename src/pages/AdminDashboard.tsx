import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import type { Bus } from "@/components/ShuttleMap";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bus as BusIcon, MapPin, Clock, WifiOff, Eye } from "lucide-react";
import { useLiveBuses } from "@/hooks/use-live-buses";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { buses } = useLiveBuses();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin-login");
    }
  }, [navigate]);

  const onlineBuses = buses.filter((b) => b.connectionStatus === "online");
  const offlineBuses = buses.filter((b) => b.connectionStatus === "offline");
  const avgOccupancy = buses.length
    ? Math.round(buses.reduce((sum, b) => sum + (b.occupancy / b.capacity) * 100, 0) / buses.length)
    : 0;

  const filteredBuses =
    filter === "all" ? buses :
    filter === "online" ? onlineBuses :
    offlineBuses;

  const stats = [
    { label: "Total Buses", value: buses.length, icon: BusIcon },
    { label: "Online", value: onlineBuses.length, icon: MapPin },
    { label: "Offline", value: offlineBuses.length, icon: WifiOff },
    { label: "Avg Occupancy", value: `${avgOccupancy}%`, icon: Clock },
  ];

  useEffect(() => {
    if (!selectedBus) {
      return;
    }

    const updated = buses.find((bus) => bus.id === selectedBus.id);
    if (updated) {
      setSelectedBus(updated);
      return;
    }

    setSelectedBus(null);
  }, [buses, selectedBus]);

  const occupancyPercent = selectedBus ? Math.round((selectedBus.occupancy / selectedBus.capacity) * 100) : 0;
  const occColor = occupancyPercent > 85 ? "bg-status-danger" : occupancyPercent > 60 ? "bg-status-warning" : "bg-status-live";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader liveBusCount={onlineBuses.length} isAdmin />

      <main className="w-full px-3 sm:px-6 lg:px-10 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</p>
                <p className="text-lg sm:text-xl font-semibold font-mono-track">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Fleet Table */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-sm font-semibold">Fleet Overview</h2>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1">All</TabsTrigger>
                  <TabsTrigger value="online" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1">Online</TabsTrigger>
                  <TabsTrigger value="offline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1">Offline</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Bus #</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Route</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Driver</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Occupancy</TableHead>
                    <TableHead className="text-xs">ETA</TableHead>
                    <TableHead className="text-xs w-10 sm:w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map((bus) => {
                    const occ = Math.round((bus.occupancy / bus.capacity) * 100);
                    const barColor = occ > 85 ? "bg-status-danger" : occ > 60 ? "bg-status-warning" : "bg-status-live";
                    return (
                      <TableRow key={bus.id} className={selectedBus?.id === bus.id ? "bg-accent" : ""}>
                        <TableCell className="font-semibold text-xs sm:text-sm">{bus.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{bus.route}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{bus.driver}</TableCell>
                        <TableCell>
                          {bus.connectionStatus === "online" ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium ${
                            "bg-status-live/10 text-status-live border border-status-live/30"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
                            Online
                          </span>
                          ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            Offline
                          </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${occ}%` }} />
                            </div>
                            <span className="text-[11px] font-mono-track">{occ}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono-track">{bus.eta} min</TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedBus(bus)}
                            aria-label={`View details for bus ${bus.name}`}
                            title={`View details for bus ${bus.name}`}
                            className="p-1 sm:p-1.5 rounded-md hover:bg-accent transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {!selectedBus ? (
              <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
                <BusIcon className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Select a bus to view details</p>
              </div>
            ) : (
              <div className="space-y-3 animate-slide-up">
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Bus {selectedBus.name}</h2>
                      <p className="text-xs text-muted-foreground">{selectedBus.route}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      selectedBus.connectionStatus === "online"
                        ? "bg-status-live/10 border border-status-live/30 text-status-live"
                        : "bg-secondary border border-border text-muted-foreground"
                    }`}>
                      {selectedBus.connectionStatus === "online" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
                      )}
                      {selectedBus.connectionStatus === "online" ? "Online" : "Offline"}
                    </span>
                  </div>

                  {/* ETA Next Stop */}
                  <div className="bg-surface-sunken rounded-lg p-4 text-center mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">ETA Next Stop</p>
                    <p className="font-mono-track text-3xl font-bold">{selectedBus.eta}</p>
                    <p className="text-xs text-muted-foreground">min</p>
                  </div>

                  {/* Time to Reach Bus */}
                  <div className="bg-surface-sunken rounded-lg p-4 text-center mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Time to Reach Bus</p>
                    <p className="font-mono-track text-3xl font-bold">{selectedBus.eta + 2}</p>
                    <p className="text-xs text-muted-foreground">min</p>
                  </div>

                  {/* Passengers */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium">Passengers</span>
                      <span className="text-xs font-mono-track font-medium">{selectedBus.occupancy} / {selectedBus.capacity}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${occColor}`} style={{ width: `${occupancyPercent}%` }} />
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div>
                    <h3 className="text-xs font-semibold mb-2">Driver Information</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{selectedBus.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Badge ID</span>
                        <span className="font-mono-track font-medium">DRV-{selectedBus.id.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-mono-track font-medium">{selectedBus.speed > 0 ? `${selectedBus.speed} km/h` : "Stopped"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
