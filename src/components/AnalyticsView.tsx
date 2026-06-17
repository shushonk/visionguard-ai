import React, { useState } from "react";
import { Activity, AlertTriangle, Users, Map, Clock, ArrowRight, ArrowUpRight, ArrowDownRight, Crosshair, ShieldAlert } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { cn } from "../lib/utils";

const dailyTrendData = [
  { time: 'Mon', critical: 12, warning: 30, resolved: 42 },
  { time: 'Tue', critical: 8, warning: 25, resolved: 33 },
  { time: 'Wed', critical: 15, warning: 40, resolved: 55 },
  { time: 'Thu', critical: 22, warning: 50, resolved: 72 },
  { time: 'Fri', critical: 10, warning: 35, resolved: 45 },
  { time: 'Sat', critical: 5, warning: 15, resolved: 20 },
  { time: 'Sun', critical: 3, warning: 10, resolved: 13 },
];

const severityData = [
  { name: 'Critical', value: 45, color: '#ef4444' },
  { name: 'High', value: 85, color: '#f97316' },
  { name: 'Medium', value: 120, color: '#eab308' },
  { name: 'Low', value: 210, color: '#3b82f6' },
];

const eventTypeData = [
  { name: 'PPE Violation', matches: 145 },
  { name: 'Intrusion', matches: 82 },
  { name: 'Vehicle', matches: 64 },
  { name: 'Crowding', matches: 45 },
  { name: 'Fire/Smoke', matches: 12 },
];

export function AnalyticsView() {
  const [timeframe, setTimeframe] = useState("7D");

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-xl font-bold text-slate-100">System Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Holistic insights into security events, AI performance, and operational health.</p>
         </div>
         <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            {["24H", "7D", "30D", "YTD"].map(tf => (
               <button 
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-colors", timeframe === tf ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200")}
               >
                  {tf}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
         {[
            { label: "Total Detections Today", value: "24.5k", trend: "+12%", up: true, icon: Activity },
            { label: "People Detected", value: "18.2k", trend: "+5%", up: true, icon: Users },
            { label: "Vehicles Detected", value: "6.3k", trend: "-2%", up: false, icon: Map },
            { label: "Alerts Needing Review", value: "84", trend: "+14", up: false, icon: Clock },
            { label: "Critical Events", value: "12", trend: "-3", up: true, icon: AlertTriangle },
            { label: "Average AI Confidence", value: "96.4%", trend: "+0.2%", up: true, icon: Crosshair },
            { label: "Most Active Site", value: "Bengaluru", trend: "High Traffic", up: false, icon: Map },
            { label: "Most Risky Zone", value: "Gate A", trend: "14 incident(s)", up: false, icon: ShieldAlert },
            { label: "Offline Cameras", value: "6", trend: "-2", up: true, icon: AlertTriangle },
            { label: "Average Response Time", value: "2m 14s", trend: "-1m", up: true, icon: Clock },
         ].map((stat, i) => (
            <div key={i} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex flex-col">
               <div className="flex justify-between items-start mb-2">
                  <div className="p-1.5 bg-slate-800 rounded text-blue-400">
                     <stat.icon size={16} />
                  </div>
                  <span className={cn("text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded", stat.up ? "text-emerald-400 bg-emerald-400/10" : "text-orange-400 bg-orange-400/10")}>
                     {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {stat.trend}
                  </span>
               </div>
               <span className="text-xl lg:text-2xl font-bold font-mono text-slate-100 truncate" title={stat.value}>{stat.value}</span>
               <span className="text-[9px] lg:text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1 truncate" title={stat.label}>{stat.label}</span>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Alerts by Hour */}
         <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 lg:col-span-2 flex flex-col min-h-[350px]">
            <h2 className="text-sm font-semibold text-slate-100 mb-6 flex items-center gap-2">
               Alerts by Hour (Today)
            </h2>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                     />
                     <Area type="monotone" dataKey="warning" stackId="1" stroke="#eab308" fill="url(#colorWarn)" />
                     <Area type="monotone" dataKey="critical" stackId="2" stroke="#ef4444" fill="url(#colorCrit)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Alerts By Severity */}
         <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 flex flex-col min-h-[350px]">
            <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
               Alerts by Severity
            </h2>
            <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                     >
                        {severityData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 pt-6 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold font-mono text-slate-100">460</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Total</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
               {severityData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}/>
                     {item.name}
                  </div>
               ))}
            </div>
         </div>

         {/* Extracted Event Types */}
         <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 lg:col-span-2 flex flex-col min-h-[300px]">
             <h2 className="text-sm font-semibold text-slate-100 mb-6 flex items-center gap-2">
               Detection Type Breakdown
            </h2>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventTypeData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                     <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                     />
                     <Bar dataKey="matches" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                        {eventTypeData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#3b82f6'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Camera Health */}
         <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 flex flex-col min-h-[300px]">
             <h2 className="text-sm font-semibold text-slate-100 mb-6 flex items-center gap-2">
               Camera Health
            </h2>
            <div className="flex-1 w-full min-h-0 relative flex flex-col items-center justify-center gap-2">
                 <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Online</span>
                    <span className="text-sm font-bold text-emerald-400">95%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                 </div>

                 <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Offline</span>
                    <span className="text-sm font-bold text-red-500">2%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '2%' }}></div>
                 </div>

                 <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Warning (Low FPS/Drop)</span>
                    <span className="text-sm font-bold text-yellow-500">3%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '3%' }}></div>
                 </div>
            </div>
         </div>

      </div>
    </div>
  );
}
