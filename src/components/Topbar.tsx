import React from "react";
import { Search, Bell, Menu, Activity, ShieldCheck, Clock } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-slate-100"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search cameras, zones..." 
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-48 focus:w-64 transition-all"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono font-medium ml-2">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 text-sm font-mono border-r border-slate-800 pr-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} className="text-blue-500" />
            <span>{formatDate(time)}</span>
            <span className="text-slate-200 font-bold ml-1">{formatTime(time)}</span>
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-emerald-500 font-semibold tracking-wide uppercase text-xs">Secure</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
          <button 
             onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Opening notifications...' }))}
             className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors rounded-full hover:bg-slate-800"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-slate-950"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
