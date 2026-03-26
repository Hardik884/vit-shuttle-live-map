import { Bell, Bus } from "lucide-react";

interface DashboardHeaderProps {
  liveBusCount: number;
  notificationCount: number;
}

const DashboardHeader = ({ liveBusCount, notificationCount }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-none">NexTrack</h1>
            <p className="text-[11px] text-primary-foreground/50">VIT Vellore · Student Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-live/15 border border-status-live/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
            <span className="text-xs font-medium text-status-live">{liveBusCount} buses live</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-status-danger text-[10px] font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
