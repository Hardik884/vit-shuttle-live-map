import { Bus, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  liveBusCount: number;
  isAdmin?: boolean;
}

const DashboardHeader = ({ liveBusCount, isAdmin = false }: DashboardHeaderProps) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-[1000] bg-primary text-primary-foreground">
      <div className="w-full px-2 sm:px-3 h-12 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight leading-none">NexTrack</h1>
            <p className="text-[10px] sm:text-[11px] text-primary-foreground/50">
              VIT Vellore · {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-status-live/15 border border-status-live/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse-dot" />
            <span className="text-[10px] sm:text-xs font-medium text-status-live">{liveBusCount} live</span>
          </div>
          {isAdmin ? (
            <Link
              to="/"
              className="text-[11px] sm:text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              Student View
            </Link>
          ) : (
            <Link
              to="/admin-login"
              className="text-[11px] sm:text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors"
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
