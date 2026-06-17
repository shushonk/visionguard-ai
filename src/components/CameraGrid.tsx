import React from "react";
import { Camera, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

const cameras = [
  { id: "CAM-01", location: "Main Gate Entry", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "98%" },
  { id: "CAM-02", location: "Warehouse Area B", status: "live", alert: true, fps: 28, quality: "4K", confidence: "92%" },
  { id: "CAM-03", location: "Perimeter Fence North", status: "offline", alert: false, fps: 0, quality: "720p", confidence: "0%" },
  { id: "CAM-04", location: "Employee Parking", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "95%" },
];

export function CameraGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {cameras.map((cam) => (
        <div key={cam.id} className={cn(
          "bg-slate-900 border rounded-xl overflow-hidden flex flex-col group",
          cam.alert ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-slate-800"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-slate-950/50 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-200">{cam.id}</span>
              <span className="text-xs text-slate-500 hidden sm:inline">- {cam.location}</span>
            </div>
            <div className="flex items-center gap-3">
              {cam.alert && (
                <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <AlertTriangle size={12} /> Alert
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                cam.status === 'live' ? "text-emerald-400 bg-emerald-400/10" : "text-slate-500 bg-slate-800"
              )}>
                {cam.status === 'live' && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
                {cam.status}
              </div>
            </div>
          </div>
          
          {/* Video Placeholder Area */}
          <div className="relative aspect-video bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
            {cam.status === 'live' ? (
              <>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 to-transparent"></div>
                
                {/* Simulated scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,_rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10" />
                
                {cam.alert ? (
                   <div className="absolute inset-0 border-2 border-red-500/50 animate-pulse z-10" />
                ) : null}
                
                {/* Bounding box simulation if an alert is present */}
                {cam.alert && (
                  <div className="absolute top-1/4 left-1/3 w-1/4 h-1/3 border border-red-500 bg-red-500/10 z-20">
                     <span className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1 font-mono uppercase tracking-wider">Unauthorized</span>
                  </div>
                )}
                 
                 <div className="z-20 text-slate-600 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                   {cam.alert ? <span className="text-red-500/50">Tracking Target</span> : <span>Monitoring Active</span>}
                 </div>
              </>
            ) : (
                <div className="text-slate-600 flex items-center justify-center h-full text-xs font-mono uppercase tracking-widest">
                  Signal Lost
                </div>
            )}
            
            {/* OSD (On Screen Display) Metadata */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-20 pointer-events-none">
              <div className="text-[9px] text-emerald-500/80 font-mono flex flex-col">
                <span>{cam.quality} @ {cam.fps}fps</span>
                <span>AI Confidence: {cam.confidence}</span>
              </div>
              <div className="text-[9px] text-white/50 font-mono bg-black/40 px-1 rounded">
                REC ●
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
