import React from "react";
import {
  LayoutDashboard,
  Video,
  BellRing,
  BarChart3,
  Map,
  Settings,
  Shield,
  Menu,
} from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Analysis", icon: Video },
  { id: "cameras", label: "Monitor", icon: Video },
  { id: "alerts", label: "Review", icon: BellRing },
  { id: "analytics", label: "Insights", icon: BarChart3 },
  { id: "zones", label: "Zones", icon: Map },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 hidden md:flex",
          isOpen ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-800 shrink-0 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
              <Shield size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-slate-100 italic">VisionGuard</h1>
              <p className="text-[9px] text-blue-400 tracking-widest uppercase font-semibold">Security Management</p>
            </div>
          </div>
          <button 
            className="md:hidden ml-auto text-slate-400 hover:text-slate-100"
            onClick={() => setIsOpen(false)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 tracking-widest mb-3 px-3 uppercase">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <Icon size={18} className={cn("transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700">
                A
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">System Operator</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
