import React from "react";
import { StatCard } from "./StatCard";
import { Camera, AlertTriangle, Users, Car, HeartPulse, BrainCircuit, Activity, Clock, ShieldAlert, MonitorCheck, Plus, Video, PlayCircle, BarChart3, Bell, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { cn } from "../lib/utils";

const dummyAlertData = [
  { time: '00:00', alerts: 4 },
  { time: '04:00', alerts: 2 },
  { time: '08:00', alerts: 12 },
  { time: '12:00', alerts: 25 },
  { time: '16:00', alerts: 35 },
  { time: '20:00', alerts: 18 },
  { time: '24:00', alerts: 5 },
];

export function DashboardView() {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-100 italic">
          Good evening, Admin
        </h1>
        <p className="text-slate-400">
          Here’s what needs attention across your monitored sites.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         <div className="relative z-10">
            <h2 className="text-lg font-bold text-slate-100 mb-2">Today’s situation summary</h2>
            <p className="text-slate-400 max-w-3xl leading-relaxed">
               Most monitored areas are stable. VisionGuard has identified a few events around warehouse access, parking zones, and camera health that may need your review. No critical emergencies have been confirmed today.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Cameras Online" value="124" icon={Camera} color="blue" trend="Active" trendUp={true} />
        <StatCard title="Possible Events" value="3" icon={AlertTriangle} color="orange" trend="Needs Review" trendUp={false} />
        <StatCard title="AI Confidence" value="98%" icon={MonitorCheck} color="emerald" trend="High" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left main area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Live Preview Strip */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Camera size={18} className="text-blue-500" />
                Live Feed Highlights
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono"><Clock size={12}/> Auto-switching</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Main Gate", status: "Online", alert: false },
                { name: "Warehouse B", status: "Review Recommended", alert: true },
                { name: "Parking Area", status: "Online", alert: false },
                { name: "Side Access", status: "Offline", alert: true, offline: true },
              ].map((cam, i) => (
                <div key={i} className={cn("relative aspect-video rounded-lg overflow-hidden border bg-slate-950", 
                    cam.alert ? (cam.offline ? "border-amber-500/30" : "border-blue-500/30") : "border-slate-800")}>
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-white/80 border border-white/5 z-20 uppercase tracking-widest">
                    {cam.offline ? (
                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                    ) : (
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                    {cam.offline ? 'Offline' : 'Live'}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-bold z-20">
                    {cam.name}
                  </div>

                  {cam.alert && !cam.offline && (
                      <div className="absolute inset-0 border border-blue-500/20 animate-pulse pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
             <p className="text-xs text-slate-500 mt-4 italic">
              Critical alerts are highlighted first so your team can respond quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Navigating to frame analysis...' }))}
                  className="flex items-start flex-col gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-slate-900 transition-colors text-left group"
                >
                   <div className="p-1.5 bg-blue-500/10 rounded text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"><SearchIcon size={16}/></div>
                   <span className="text-xs font-semibold text-slate-200">Analyze a Frame</span>
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Camera setup opened.' }))}
                  className="flex items-start flex-col gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-900 transition-colors text-left group"
                >
                   <div className="p-1.5 bg-slate-800 rounded text-slate-400 group-hover:bg-slate-700 transition-colors"><Plus size={16}/></div>
                   <span className="text-xs font-semibold text-slate-200">Add Camera</span>
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Opening alert queue...' }))}
                  className="flex items-start flex-col gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-900 transition-colors text-left group"
                >
                   <div className="p-1.5 bg-slate-800 rounded text-slate-400 group-hover:bg-slate-700 transition-colors"><Bell size={16}/></div>
                   <span className="text-xs font-semibold text-slate-200">Review Alerts</span>
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Zone management opened.' }))}
                  className="flex items-start flex-col gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-900 transition-colors text-left group"
                >
                   <div className="p-1.5 bg-slate-800 rounded text-slate-400 group-hover:bg-slate-700 transition-colors"><Plus size={16}/></div>
                   <span className="text-xs font-semibold text-slate-200">Manage Zones</span>
                </button>
              </div>
            </div>

            {/* Site Health */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
                <HeartPulse size={16} className="text-emerald-500" />
                Site Health
              </h2>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">Camera Network Uptime</span>
                   <span className="text-emerald-400 font-semibold">99.8%</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">AI Inference Service</span>
                   <span className="text-emerald-400 font-semibold">Operational</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">Notification Routing</span>
                   <span className="text-emerald-400 font-semibold">Operational</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">Storage Capacity</span>
                   <div className="flex items-center gap-2 w-1/2 justify-end">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[64%]"></div>
                      </div>
                      <span className="text-slate-300 font-mono">64%</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400">Database Synchronization</span>
                   <span className="text-emerald-400 font-semibold">Synced 1m ago</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Alert Volume Chart */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 h-64 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <Activity size={16} className="text-blue-500" />
              Incident Volume (Today)
            </h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyAlertData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right side area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* General Security Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4 relative z-10">
              <ShieldAlert size={16} className="text-blue-400" />
              General Security Overview
            </h2>
            
            <div className="mb-4 relative z-10">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Most active site</span>
               <div className="flex items-end gap-3 text-slate-200">
                  <span className="text-2xl font-bold leading-none tracking-tight">Warehouse Area B</span>
               </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-800">
                <span className="text-slate-500">Most active camera</span>
                <span className="font-semibold text-slate-300">Warehouse B-04</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-800">
                <span className="text-slate-500">Latest activity</span>
                <span className="font-semibold text-slate-300">Vehicle detected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Events needing review</span>
                <span className="font-semibold text-blue-400">3 waiting</span>
              </div>
            </div>
          </div>

          {/* Recent AI Findings */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 flex flex-col flex-1 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <BrainCircuit size={16} className="text-purple-500" />
                Recent AI Findings
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {[
                { time: "2m ago", desc: "Person detected near Warehouse B", status: "Review Recommended", severity: "high" },
                { time: "15m ago", desc: "Vehicle parked near restricted gate", status: "Review Recommended", severity: "high" },
                { time: "1h ago", desc: "Objects found near Fire Exit", status: "Neutral", severity: "medium" },
                { time: "2h ago", desc: "Camera CAM-32 is currently offline", status: "System", severity: "low" },
                { time: "3h ago", desc: "Routine perimeter check complete", status: "Neutral", severity: "low" },
              ].map((finding, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="flex flex-col items-center mt-0.5">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", 
                      finding.severity === "high" ? "bg-blue-500" :
                      finding.severity === "medium" ? "bg-slate-500" : "bg-slate-700"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-0.5">{finding.desc}</p>
                    <div className="flex items-center justify-between text-[11px]">
                       <span className={cn(
                          "font-bold",
                          finding.severity === "high" ? "text-blue-400" : "text-slate-500"
                       )}>{finding.status}</span>
                       <span className="text-slate-500 font-mono">{finding.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-slate-800 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
               Review All Activity <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function BellIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
}

function SearchIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
