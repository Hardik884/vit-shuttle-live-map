import { Bus, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  liveBusCount: number;
  isAdmin?: boolean;
}

const DashboardHeader = ({ liveBusCount, isAdmin = false }: DashboardHeaderProps) => {
  const hasLiveBuses = liveBusCount > 0;

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
    <header className="sticky top-0 z-[1000] bg-nav text-nav-foreground">
      <div className="w-full px-2 sm:px-3 h-12 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-nav-foreground/10 border border-nav-foreground/20 flex items-center justify-center">
            <Bus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight leading-none">NexTrack</h1>
            <p className="text-[10px] sm:text-[11px] text-nav-foreground/50">
              VIT Vellore · {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-nav-foreground/10 border border-nav-foreground/20 flex items-center justify-center hover:bg-nav-foreground/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${
              hasLiveBuses
                ? "bg-status-live/15 border-status-live/30"
                : "bg-secondary border-border"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hasLiveBuses ? "bg-status-live animate-pulse-dot" : "bg-muted-foreground"
              }`}
            />
            <span className={`text-[10px] sm:text-xs font-medium ${hasLiveBuses ? "text-status-live" : "text-muted-foreground"}`}>
              {hasLiveBuses ? `${liveBusCount} live` : "Offline"}
            </span>
          </div>
          {isAdmin ? (
            <Link
              to="/"
              className="text-[11px] sm:text-sm font-medium text-nav-foreground hover:text-nav-foreground/80 transition-colors"
            >
              Student View
            </Link>
          ) : (
            <Link
              to="/admin-login"
              className="text-[11px] sm:text-sm font-medium text-nav-foreground hover:text-nav-foreground/80 transition-colors"
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
