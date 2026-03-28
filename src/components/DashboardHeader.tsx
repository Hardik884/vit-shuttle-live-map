import { Bus } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  liveBusCount: number;
  isAdmin?: boolean;
}

const DashboardHeader = ({ liveBusCount, isAdmin = false }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-[1000] bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-none">NexTrack</h1>
            <p className="text-[11px] text-primary-foreground/50">
              VIT Vellore · {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-live/15 border border-status-live/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
            <span className="text-xs font-medium text-status-live">{liveBusCount} buses live</span>
          </div>
          {isAdmin ? (
            <Link
              to="/"
              className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Student View
            </Link>
          ) : (
            <Link
              to="/admin-login"
              className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
