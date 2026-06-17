import React, { useState } from "react";
import { Camera, AlertTriangle, Filter, LayoutGrid, List, Clock, Video, Search, Play, X, Upload } from "lucide-react";
import { cn } from "../lib/utils";

const LOCAL_VIDEOS = [
  { id: 'factory', name: 'Factory PPE Check', path: '/videos/factory-demo.mp4' },
  { id: 'parking', name: 'Parking Blockage', path: '/videos/parking-demo.mp4' },
  { id: 'warehouse', name: 'Warehouse Safety', path: '/videos/warehouse-demo.mp4' },
  { id: 'entrance', name: 'Entrance Intrusion', path: '/videos/entrance-demo.mp4' },
  { id: 'crowd', name: 'Crowd Monitoring', path: '/videos/crowd-demo.mp4' },
  { id: 'traffic', name: 'Traffic Monitoring', path: '/videos/traffic-demo.mp4' },
  { id: 'fire-smoke', name: 'Fire Smoke Demo', path: '/videos/fire-smoke-demo.mp4' },
  { id: 'construction', name: 'Construction Safety', path: '/videos/construction-demo.mp4' }
];

const cameras = [
  { id: "CAM-01", location: "Main Gate Entry", site: "Bengaluru Command Site", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "98%" },
  { id: "CAM-02", location: "Warehouse Area B", site: "Bengaluru Command Site", status: "live", alert: true, alertType: "Intrusion", fps: 28, quality: "4K", confidence: "92%" },
  { id: "CAM-03", location: "Perimeter Fence North", site: "Mumbai Port Security", status: "offline", alert: false, fps: 0, quality: "720p", confidence: "0%" },
  { id: "CAM-04", location: "Employee Parking", site: "Mumbai Port Security", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "95%" },
  { id: "CAM-05", location: "Loading Dock 1", site: "Mumbai Port Security", status: "live", alert: false, fps: 30, quality: "1080p", confidence: "99%" },
  { id: "CAM-06", location: "Server Room", site: "Delhi Metro Hub", status: "live", alert: true, alertType: "Smoke", fps: 30, quality: "4K", confidence: "96%" },
  { id: "CAM-07", location: "Cafeteria Exit", site: "Delhi Metro Hub", status: "live", alert: false, fps: 15, quality: "720p", confidence: "88%" },
  { id: "CAM-08", location: "Elevator Lobby", site: "New York Security Hub", status: "warning", alert: false, fps: 10, quality: "1080p", confidence: "60%" },
  { id: "CAM-09", location: "Fire Exit West", site: "New York Security Hub", status: "live", alert: true, alertType: "Blocked", fps: 24, quality: "1080p", confidence: "91%" },
  { id: "CAM-10", location: "Factory Floor Line A", site: "Berlin Industrial Site", status: "live", alert: false, fps: 30, quality: "4K", confidence: "95%" },
  { id: "CAM-11", location: "Factory Floor Line B", site: "Berlin Industrial Site", status: "live", alert: true, alertType: "PPE Missing", fps: 30, quality: "4K", confidence: "89%" },
  { id: "CAM-12", location: "Forklift Path", site: "Singapore Port Security", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "93%" },
  { id: "CAM-13", location: "Parking Gate East", site: "Singapore Port Security", status: "offline", alert: false, fps: 0, quality: "1080p", confidence: "0%" },
  { id: "CAM-14", location: "Visitor Entry", site: "Dubai Critical Facility", status: "live", alert: false, fps: 30, quality: "4K", confidence: "97%" },
  { id: "CAM-15", location: "Security Cabin", site: "Dubai Critical Facility", status: "live", alert: false, fps: 30, quality: "1080p", confidence: "99%" },
  { id: "CAM-16", location: "Cash Counter", site: "São Paulo Retail Security", status: "warning", alert: false, fps: 15, quality: "720p", confidence: "82%" },
  { id: "CAM-17", location: "Mall Entrance", site: "São Paulo Retail Security", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "94%" },
  { id: "CAM-18", location: "Crowd Queue Area", site: "Tokyo Smart City Zone", status: "live", alert: true, alertType: "Crowd", fps: 30, quality: "4K", confidence: "85%" },
  { id: "CAM-19", location: "Construction Zone", site: "Johannesburg Logistics Site", status: "live", alert: true, alertType: "Hazard", fps: 24, quality: "1080p", confidence: "96%" },
  { id: "CAM-20", location: "Sensitive Asset Room", site: "London Surveillance Node", status: "live", alert: false, fps: 30, quality: "4K", confidence: "98%" },
  { id: "CAM-21", location: "Road Junction", site: "Los Angeles Traffic Center", status: "live", alert: true, alertType: "Congestion", fps: 30, quality: "1080p", confidence: "90%" },
  { id: "CAM-22", location: "School Entrance", site: "Sydney Campus Zone", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "91%" },
  { id: "CAM-23", location: "Hospital Lobby", site: "Toronto Facility Watch", status: "warning", alert: false, fps: 15, quality: "1080p", confidence: "75%" },
  { id: "CAM-24", location: "Warehouse Aisle 4", site: "Amsterdam Airport Zone", status: "live", alert: false, fps: 24, quality: "1080p", confidence: "92%" },
];

export function CamerasView() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraFeeds, setCameraFeeds] = useState<Record<string, { id: string, name: string, path: string }>>({});
  const [cameraStatuses, setCameraStatuses] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeUploadCam, setActiveUploadCam] = useState<string | null>(null);

  const handleUploadClick = (camId: string) => {
    setActiveUploadCam(camId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadCam) {
       const url = URL.createObjectURL(file);
       setCameraFeeds(prev => ({
         ...prev,
         [activeUploadCam]: { id: 'upload', name: file.name, path: url }
       }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveUploadCam(null);
  };

  const filteredCameras = cameras.filter(cam => {
    const status = cameraStatuses[cam.id] || cam.status;
  const matchesFilter = filter === "all" || (filter === "critical" ? cam.alert : status === filter);
    const matchesSearch = cam.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.site.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeFeedsCount = Object.keys(cameraFeeds).length;
  
  let topStatus = "NO ACTIVE FEEDS";
  let topStatusColor = "text-slate-500 bg-slate-800";
  if (activeFeedsCount > 0) {
    topStatus = "LIVE";
    topStatusColor = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  }

  return (
    <div className="space-y-6 flex flex-col h-full min-h-[calc(100vh-8rem)]">
      <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
      {/* Header */}
      <div className="flex flex-col gap-1">
         <div className="flex items-center gap-3">
           <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             Cameras
           </h1>
           <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded", topStatusColor)}>
             {topStatus}
           </span>
         </div>
         <p className="text-slate-400 text-sm">
           Monitor connected cameras, camera health, and active AI alerts.
         </p>
      </div>

      {/* Top Controls & Health Summary */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start shrink-0">
              {['all', 'live', 'offline', 'warning', 'critical'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all",
                    filter === f ? "bg-slate-800 text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input type="text" placeholder="Search by camera ID, location, or site..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 w-full" />
            </div>
        </div>

        <div className="flex flex-wrap gap-4 lg:gap-8 items-center text-sm font-mono px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Online:</span>
            <span className="text-slate-200 font-bold">124</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">Offline:</span>
            <span className="text-slate-200 font-bold">4</span>
          </div>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Avg FPS:</span>
            <span className="text-blue-400 font-bold">25.4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Storage Usage:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
              <div className="bg-blue-500 h-full w-[72%]"></div>
            </div>
            <span className="text-slate-200 text-xs">72%</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
        {filteredCameras.map((cam) => {
          return (
            <div key={cam.id} className={cn(
              "bg-slate-900 border rounded-xl overflow-hidden flex flex-col group transition-all",
              cam.alert ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20" : "border-slate-800 hover:border-slate-600"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 border-b border-slate-800/80 z-20">
                <div>
                  <div className="flex items-center gap-2">
                    <Camera size={14} className={cam.status === 'live' ? "text-blue-400" : cam.status === 'warning' ? "text-yellow-500" : "text-slate-600"} />
                    <span className="text-sm font-bold text-slate-200">{cam.id}</span>
                  </div>
                  <span className="text-[10px] tracking-wide text-slate-300 truncate block max-w-[150px] mt-0.5">{cam.location}</span>
                  <span className="text-[9px] uppercase text-slate-500 truncate block max-w-[150px] mt-0.5">{cam.site}</span>
                </div>
                <div className="flex items-center gap-2">
                  {cam.alert && (
                    <div className="flex items-center gap-1 text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.3)]">
                      <AlertTriangle size={12} /> Attention needed
                    </div>
                  )}
                  <div className={cn(
                    "flex flex-col items-center justify-center p-1 rounded-full",
                    cam.status === 'live' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                  )} title={cam.status}>
                    {cam.status === 'live' ? (
                       <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    ) : (
                       <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Video Area */}
              <div className="relative aspect-video bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
                {cameraFeeds[cam.id] ? (
                    <>
                       <video 
                          key={cameraFeeds[cam.id].path}
                          src={cameraFeeds[cam.id].path}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                       />
                       <div className="absolute top-2 right-2 bg-blue-500 text-white font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur">
                          Local Demo
                       </div>
                    </>
                ) : cam.status === 'offline' ? (
                    <div className="flex flex-col items-center gap-2 text-slate-600 z-10 w-full h-full justify-center bg-slate-950">
                      <span className="text-sm font-bold text-slate-400">Camera offline</span>
                      <span className="text-[10px] text-slate-500">Last checked a few minutes ago.</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 z-10 w-full h-full justify-center bg-slate-950 px-4 text-center">
                      <Video size={32} className="text-slate-700 mb-2"/>
                      <span className="text-xs font-semibold text-slate-300">No feed connected</span>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight">Attach a local demo clip or upload a video to test this camera.</span>
                    </div>
                )}
                
                {/* OSD (On Screen Display) Metadata */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-sm text-white/80 font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                     <Clock size={8} /> 2026-06-17 {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {cameraFeeds[cam.id] && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-20 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-sm px-1.5 py-1 rounded border border-white/10 text-[9px] text-blue-400 font-mono flex flex-col gap-0.5 shadow-sm">
                        <span>RES: {cam.quality}</span>
                        <span>FPS: {cam.fps}</span>
                        <span>CONF: {cam.confidence}</span>
                      </div>
                      <div className="text-[9px] text-red-500 font-mono font-bold bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> REC
                      </div>
                    </div>
                )}
              </div>

              {/* Footer action */}
              <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex gap-2">
                 {cameraFeeds[cam.id] ? (
                    <>
                       <button className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider rounded transition-colors" onClick={() => {
                          const event = new CustomEvent('show-toast', { detail: 'Snapshot analyzed. Review event added.' });
                          window.dispatchEvent(event);
                       }}>
                          Analyze Snapshot
                       </button>
                       <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded transition-colors" onClick={() => {
                          const event = new CustomEvent('show-toast', { detail: 'Opening feed...' });
                          window.dispatchEvent(event);
                       }}>
                          Open Feed
                       </button>
                       <button 
                          onClick={() => {
                              const newFeeds = {...cameraFeeds};
                              delete newFeeds[cam.id];
                              setCameraFeeds(newFeeds);
                          }}
                          className="flex-none px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                          title="Remove Feed"
                       >
                          <X size={14} />
                       </button>
                    </>
                 ) : status === 'offline' ? (
                    <button disabled className="w-full py-1.5 bg-slate-900 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded border border-slate-800/50 cursor-not-allowed">
                       Camera Offline
                    </button>
                 ) : (
                    <>
                       <button onClick={() => handleUploadClick(cam.id)} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5">
                          <Upload size={12} /> Upload Video
                       </button>
                       <button onClick={() => setCameraStatuses({...cameraStatuses, [cam.id]: 'offline'})} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5">
                          Mark Offline
                       </button>
                    </>
                 )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  );
}
