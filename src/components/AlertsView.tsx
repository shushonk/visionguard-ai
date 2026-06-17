import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Clock, CheckCircle2, ShieldAlert, Filter, Search, MoreVertical, Eye, MapPin, CheckSquare, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

const initialAlerts = [
  { id: "EVT-099", type: "Unrecognized person", severity: "high", camera: "Warehouse Area B", time: "Just now", confidence: 95, status: "needs review", description: "A person was detected in a restricted area. Please confirm if they are authorized staff." },
  { id: "EVT-098", type: "Possible smoke", severity: "critical", camera: "Server Room", time: "2 mins ago", confidence: 98, status: "investigating", description: "Visual indicators suggest possible smoke. Immediate physical inspection recommended." },
  { id: "EVT-097", type: "Vehicle stationary", severity: "medium", camera: "Main Gate Entry", time: "8 mins ago", confidence: 88, status: "needs review", description: "A vehicle has been parked in a through-lane for over 5 minutes." },
  { id: "EVT-096", type: "Congestion forming", severity: "medium", camera: "Mall Entrance", time: "15 mins ago", confidence: 92, status: "needs review", description: "Entrance density is increasing. Monitoring for flow issues." },
  { id: "EVT-095", type: "Blocked exit", severity: "critical", camera: "Fire Exit West", time: "22 mins ago", confidence: 96, status: "needs review", description: "An object is obstructing the emergency exit. Needs removal." },
  { id: "EVT-094", type: "Routine check", severity: "low", camera: "Perimeter Fence North", time: "35 mins ago", confidence: 90, status: "resolved", description: "Standard activity detected near perimeter fence. Logged for records." },
];

export function AlertsView() {
  const [activeTab, setActiveTab] = useState("All");

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "low": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "needs review": return "text-red-400";
      case "investigating": return "text-orange-400";
      case "resolved": return "text-emerald-400";
      default: return "text-slate-400";
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlerts = initialAlerts.filter(alert => {
    let matchesTab = true;
    if (activeTab === "Critical") matchesTab = alert.severity === "critical";
    else if (activeTab === "High") matchesTab = alert.severity === "high";
    else if (activeTab === "Needs Review") matchesTab = alert.status === "needs review";
    else if (activeTab === "Resolved") matchesTab = alert.status === "resolved";
    
    const matchesSearch = alert.camera.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mb-2">
         <h1 className="text-2xl font-bold text-slate-100 italic">
           Review Queue
         </h1>
         <p className="text-slate-400">
           Review flagged activity to determine if further attention or response is needed.
         </p>
      </div>

      {/* Alert Priority Tabs */}
      <div className="flex border-b border-slate-800">
         {["All", "Critical", "High", "Needs Review", "Resolved"].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn("px-6 py-3 text-sm font-medium transition-colors border-b-2", activeTab === tab ? "border-blue-500 text-blue-400 bg-slate-800/30" : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/10")}
            >
               {tab}
            </button>
         ))}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg focus-within:border-blue-500/50 transition-colors">
            <Search size={16} className="text-slate-500" />
            <input type="text" placeholder="Search by camera or event..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-200 w-full sm:w-64 placeholder:text-slate-600" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Selected alerts marked as reviewed.' }))}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors w-full sm:w-auto justify-center font-medium shadow-md"
            >
              <CheckSquare size={16} /> Mark Selection Reviewed
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded bg-slate-900 border-slate-700" /></th>
                <th className="px-6 py-4">What Happened?</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Where?</th>
                <th className="px-6 py-4">AI Certainty</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
                <tr key={alert.id} className={cn(
                  "hover:bg-slate-800/50 transition-colors group",
                  alert.severity === "critical" && alert.status !== "resolved" ? "bg-red-500/[0.02]" : ""
                )}>
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-slate-900 border-slate-700" /></td>
                  <td className="px-6 py-4 font-medium flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                        {alert.severity === "critical" && alert.status !== "resolved" && <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>}
                        <span className="text-slate-100">{alert.type}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-normal truncate max-w-[250px] whitespace-normal line-clamp-1">{alert.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", getSeverityStyles(alert.severity))}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} className="text-slate-500" />
                        {alert.camera}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300">{alert.confidence}%</span>
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${alert.confidence}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" />
                        {alert.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Viewing alert evidence...' }))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                          <Eye size={14} /> View Evidence
                      </button>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Alert escalated to incident response.' }))}
                        className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 rounded-md text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                          <ShieldAlert size={14} /> Escalate
                      </button>
                      {alert.status !== "resolved" && (
                          <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Alert resolved.' }))}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                              <CheckCircle2 size={14} /> Resolve
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                           <CheckCircle2 size={32} className="text-emerald-500/50 mb-3" />
                           <p className="text-sm">No active alerts matching your criteria.</p>
                        </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 bg-slate-900/50">
          <span>Showing {filteredAlerts.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors">Prev</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded shadow">1</button>
            <button className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
