import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Upload, AlertTriangle, ShieldCheck, Activity, Video, Camera as CameraIcon, PlayCircle, Loader2, StopCircle, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeFrame, AnalysisFrameResult, loadModel } from '../services/detectionEngine';

export function AnalysisView() {
  const [activeTab, setActiveTab] = useState<'sources' | 'upload' | 'webcam'>('sources');
  const [sourceType, setSourceType] = useState<'image' | 'video'>('video');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  
  const [results, setResults] = useState<AnalysisFrameResult | null>(null);
  const [timeline, setTimeline] = useState<AnalysisFrameResult[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const [webcamActive, setWebcamActive] = useState(false);
  const hasVideoSource = !!previewUrl || webcamActive;
  const [cameraStatus, setCameraStatus] = useState("Camera Off");
  const [cameraError, setCameraError] = useState("");

  // Settings
  const [config, setConfig] = useState({
    enableIntrusion: true,
    enableAbandoned: true,
    enableCrowd: true,
    enableVehicles: true,
    crowdThreshold: 5
  });

  useEffect(() => {
    // Pre-load model
    loadModel().then(() => setIsModelReady(true)).catch(console.error);
    return () => {
      stopWebcam();
      setIsAutoAnalyzing(false);
    };
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    stopWebcam();
    setIsAutoAnalyzing(false);
    setTimeline([]);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (file.type.startsWith('video/')) {
       setSourceType('video');
    } else {
       setSourceType('image');
    }
    setResults(null);
  };

  const startWebcam = async () => {
      setCameraStatus("Requesting permission...");

      const isSecure =
        window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        setCameraStatus("HTTPS Required");
        setCameraError("Webcam requires HTTPS or localhost. AI Studio preview may block camera access. Open the app in a new tab or run locally.");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("Unsupported");
        setCameraError("This browser does not support webcam access.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false
        });

        webcamStreamRef.current = stream;

      if (!videoRef.current) {
        setCameraError("Video element is not ready.");
        return;
      }

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;

      await videoRef.current.play();

      setCameraStatus("Camera Live");
      setWebcamActive(true);
    } catch (error: any) {
      console.error("Webcam error:", error);

      if (error.name === "NotAllowedError") {
        setCameraStatus("Camera permission is blocked");
        setCameraError("Click the lock icon near your browser address bar, allow camera access, then try again.");
      } else if (error.name === "NotFoundError") {
        setCameraStatus("Webcam is not available");
        setCameraError("Your browser or preview window does not support webcam access. You can still upload a video.");
      } else if (error.name === "NotReadableError") {
        setCameraStatus("Camera busy");
        setCameraError("Your camera is being used by another app. Close Zoom, Meet, OBS, or Camera app and try again.");
      } else {
        setCameraStatus("Camera error");
        setCameraError("Webcam failed to start.");
      }
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    setCameraStatus("Camera Off");
  };

  const drawOverlay = (result: AnalysisFrameResult, mediaElement: HTMLVideoElement | HTMLImageElement) => {
     if (!canvasRef.current) return;
     const canvas = canvasRef.current;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     
     const rect = mediaElement.getBoundingClientRect();
     if (mediaElement instanceof HTMLVideoElement) {
       canvas.width = mediaElement.videoWidth;
       canvas.height = mediaElement.videoHeight;
     } else {
       canvas.width = mediaElement.naturalWidth || mediaElement.width;
       canvas.height = mediaElement.naturalHeight || mediaElement.height;
     }
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     
     result.detections.forEach(d => {
       const [x, y, w, h] = d.bbox;
       
       let color = '#22d3ee'; // cyan default
       if (['car','truck','bus'].includes(d.class)) color = '#3b82f6'; // blue
       if (d.class === 'person') color = '#0ea5e9'; // sky
       if (['knife','baseball bat', 'scissors'].includes(d.class)) color = '#ef4444'; // red
       
       // Change color if associated with a severe event
       const relatedEvent = result.events.find(e => e.message.includes(d.class));
       if (relatedEvent) {
          if (relatedEvent.severity === 'Critical') color = '#ef4444';
          else if (relatedEvent.severity === 'High') color = '#f97316';
       }

       ctx.strokeStyle = color;
       ctx.lineWidth = 3;
       ctx.strokeRect(x, y, w, h);
       
       ctx.fillStyle = color;
       ctx.font = '16px monospace';
       ctx.fillText(`${d.class} ${(d.score * 100).toFixed(0)}%`, x, y > 20 ? y - 5 : y + 20);
     });
  };

  const performAnalysis = async (auto = false) => {
      if (!isModelReady) return;
      const media = videoRef.current ? videoRef.current : document.getElementById("static-image") as HTMLImageElement;
      if (!media) return;

      if (media instanceof HTMLVideoElement) {
         if (media.videoWidth === 0 || media.videoHeight === 0) return;
      } else if (media instanceof HTMLImageElement) {
         if (media.naturalWidth === 0 || media.naturalHeight === 0) return;
      }

      if (!auto) setIsAnalyzing(true);
      try {
         const timestamp = (media as any).currentTime || Date.now();
         const res = await analyzeFrame(media, timestamp, config);
         setResults(res);
         drawOverlay(res, media);
         
         if (res.events.length > 0) {
            setTimeline(prev => [res, ...prev].slice(0, 50));
         }
      } catch (err) {
         console.error(err);
      } finally {
         if (!auto) setIsAnalyzing(false);
      }
  };

  useEffect(() => {
     let interval: any;
     if (isAutoAnalyzing) {
         interval = setInterval(() => {
            performAnalysis(true);
         }, 1000);
     }
     return () => clearInterval(interval);
  }, [isAutoAnalyzing, isModelReady]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:h-[calc(100vh-8rem)] min-h-[700px] w-full">
      {/* Settings / Config Panel */}
      <div className="xl:w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar xl:h-full z-10 xl:pr-2 xl:border-r xl:border-slate-800/50">
         
         {/* ACTIVE SOURCE STATUS CARD (Only visible when a source is selected) */}
         {activeTab !== 'sources' && (
             <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
                 <div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Current Source</div>
                     <div className="text-sm text-slate-200 font-bold flex items-center gap-2">
                        {activeTab === 'webcam' ? <Video size={16} className="text-blue-400" /> : <Video size={16} className="text-blue-400" />}
                        {activeTab === 'webcam' ? 'Live Webcam' : 'Uploaded Media'}
                     </div>
                 </div>
                 <button onClick={() => {
                     setIsAutoAnalyzing(false);
                     setTimeline([]);
                     setResults(null);
                     stopWebcam();
                     setPreviewUrl(null);
                     if (activeTab === 'upload' && previewUrl) URL.revokeObjectURL(previewUrl);
                     setActiveTab('sources');
                 }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700">
                    Clear Media
                 </button>
             </div>
         )}

         {/* TOGGLES CARD */}
         <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex-1">
             <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <ShieldCheck size={18} className="text-emerald-400" /> What VisionGuard Should Watch For
                </h3>
                <p className="text-xs text-slate-400">Choose the situations VisionGuard should pay attention to while analyzing video.</p>
             </div>

             <div className="space-y-6">
                 {/* Toggle 1 */}
                 <div className="flex items-start justify-between gap-4">
                     <div>
                        <div className="text-sm font-semibold text-slate-200">People entering monitored areas</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] leading-tight">Detect people appearing in restricted or monitored zones.</div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" checked={config.enableIntrusion} onChange={e=>setConfig({...config, enableIntrusion: e.target.checked})} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                     </label>
                 </div>

                 {/* Toggle 2 */}
                 <div className="flex items-start justify-between gap-4">
                     <div>
                        <div className="text-sm font-semibold text-slate-200">Vehicles blocking restricted areas</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] leading-tight">Watch for cars, trucks, buses, or bikes near gates, exits, or no-parking zones.</div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" checked={config.enableVehicles} onChange={e=>setConfig({...config, enableVehicles: e.target.checked})} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                     </label>
                 </div>

                 {/* Toggle 3 */}
                 <div className="flex items-start justify-between gap-4">
                     <div>
                        <div className="text-sm font-semibold text-slate-200">Unattended bags or objects</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] leading-tight">Flag bags or objects that stay in one place and may need human review.</div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" checked={config.enableAbandoned} onChange={e=>setConfig({...config, enableAbandoned: e.target.checked})} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                     </label>
                 </div>

                 {/* Toggle 4 */}
                 <div className="pt-6 border-t border-slate-800">
                     <div className="flex items-start justify-between gap-4 mb-4">
                         <div>
                            <div className="text-sm font-semibold text-slate-200">Crowd buildup detection</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] leading-tight">Create an alert when too many people gather in one area.</div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" checked={config.enableCrowd} onChange={e=>setConfig({...config, enableCrowd: e.target.checked})} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                         </label>
                     </div>
                     {config.enableCrowd && (
                         <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                             <div className="flex justify-between items-center mb-3">
                                 <div className="text-xs font-semibold text-slate-300">How many people count as a crowd?</div>
                             </div>
                             <input type="range" min="2" max="20" step="1" value={config.crowdThreshold} onChange={e=>setConfig({...config, crowdThreshold: parseInt(e.target.value)})} className="w-full accent-blue-500 mb-2" />
                             <div className="text-[11px] text-slate-400 font-medium">Current threshold: <span className="text-white font-bold">{config.crowdThreshold}</span> people</div>
                         </div>
                     )}
                 </div>
             </div>
         </div>

         {/* INFO CARD */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
               <AlertTriangle size={16} className="text-blue-400" />
               <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Important accuracy note</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
               Basic Browser AI can detect common objects like people, vehicles, bags, and everyday items. Advanced detection such as violence, PPE, fire/smoke, or theft-like behavior requires a custom trained YOLO model for production accuracy.
            </p>
            <div className="inline-flex self-start px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] uppercase tracking-wider font-bold rounded">
               Human review recommended for high-risk alerts
            </div>
         </div>
      </div>

      {/* Main View & Timeline */}
      <div className="flex-1 flex flex-col gap-4 xl:h-full min-h-[600px] xl:min-h-0 relative z-10 w-full min-w-0">
         
         <div className="flex-1 min-h-[300px] bg-black border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl flex items-center justify-center group">
             {/* Universal Status Badge */}
             <div className="absolute top-4 left-4 z-40 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white/90 backdrop-blur border border-white/10 flex gap-2">
                 {hasVideoSource ? (
                     isAutoAnalyzing ? (
                         <span className="text-blue-400 font-bold animate-pulse">AUTO-ANALYSIS ON</span>
                     ) : (results ? (
                         <span className="text-yellow-400 font-bold">ANALYSIS STOPPED</span>
                     ) : (
                         <span className="text-slate-300 font-bold">VIDEO READY</span>
                     ))
                 ) : (
                     <span className="text-slate-400 font-bold">WAITING FOR VIDEO</span>
                 )}
                 <span className="text-slate-400">|</span>
                 <span>{(results?.detections.length || 0)} OBJECTS</span>
                 {webcamActive && (
                  <>
                     <span className="text-slate-400">|</span>
                     <span className="text-blue-400">{cameraStatus}</span>
                  </>
                 )}
             </div>

             {!isModelReady && (
                 <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                    <p className="text-slate-300 font-medium text-sm">Initializing analysis system...</p>
                 </div>
             )}

             {activeTab === 'sources' && !previewUrl && !webcamActive && (
                 <div className="w-full h-full p-8 flex flex-col justify-start z-20 bg-slate-950 overflow-y-auto custom-scrollbar">
                     <h2 className="text-2xl font-bold text-white mb-2">Analyze Video & Webcam</h2>
                     <p className="text-slate-400 mb-8 max-w-2xl">Upload a video, analyze an image, or use webcam monitoring. VisionGuard helps identify people, vehicles, and events that may need review.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                         {/* Card 1: Upload Video (Primary) */}
                         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 hover:border-blue-500/50 hover:bg-slate-800 transition-all group/card relative overflow-hidden">
                             <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2 group-hover/card:bg-blue-500/20 transition-colors">
                                <Upload size={24} className="text-blue-400" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-100">Upload video or image</h3>
                             <p className="text-sm text-slate-400 leading-relaxed flex-1">
                                Securely process footage from your device. VisionGuard analyzes frames locally to protect your privacy.
                             </p>
                             <div className="mt-2 flex flex-col gap-3">
                                 <button onClick={() => { setActiveTab('upload'); stopWebcam(); }} className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
                                    Continue
                                 </button>
                             </div>
                         </div>
                         
                         {/* Card 2: Live Webcam */}
                         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 hover:border-blue-500/50 hover:bg-slate-800 transition-all group/card">
                             <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2 group-hover/card:bg-blue-500/20 transition-colors">
                                <CameraIcon size={24} className="text-blue-400" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-100">Use live webcam</h3>
                             <p className="text-sm text-slate-400 leading-relaxed flex-1">
                                Test monitoring using your device camera. This mode is best for testing crowd and person detection in real-time.
                             </p>
                             <div className="mt-2 flex flex-col gap-3">
                                 <button onClick={() => { setActiveTab('webcam'); startWebcam(); }} className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors border border-slate-700">
                                    Start Webcam
                                 </button>
                             </div>
                         </div>
                     </div>
                     <div className="mt-8 max-w-5xl">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 text-xs px-4 py-3 rounded-lg flex items-start gap-3">
                           <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                           <p>Webcam testing may not work inside embedded previews automatically. If you have issues, open the app in a full browser tab or run it locally.</p>
                        </div>
                     </div>
                 </div>
             )}
             
             {activeTab === 'upload' && !previewUrl && (
                <div className="p-8 flex flex-col h-full w-full items-center justify-center z-20 bg-slate-950 text-center">
                    <Upload size={48} className="mx-auto mb-4 text-slate-700" />
                    <h2 className="text-slate-200 text-xl font-bold mb-2">Upload footage to begin</h2>
                    <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">Choose an MP4, WebM, or image file. VisionGuard will review the content and create events when it finds anything that needs attention.</p>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-md py-12 relative rounded-xl border border-slate-800 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col items-center justify-center group/drop ring-1 ring-slate-800"
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                      <div className="text-center">
                          <p className="text-blue-400 font-bold mb-1 underline underline-offset-4 decoration-blue-500/30">Choose a file</p>
                          <p className="text-slate-500 text-xs">or drag and drop here</p>
                      </div>
                    </div>
                </div>
             )}

             {(!previewUrl && !webcamActive && activeTab === 'webcam') && (
                <div className="absolute inset-0 z-30 p-5 flex flex-col items-center text-center justify-center bg-slate-950">
                    <CameraIcon size={48} className="text-slate-700 mb-4" />
                    <p className="text-slate-200 text-xl font-bold mb-2">Webcam is off</p>
                    <p className="text-slate-500 text-sm max-w-sm mb-6">Click Start Webcam to allow camera access and begin live monitoring.</p>
                    <div className="flex gap-3">
                       <button onClick={startWebcam} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold shadow border border-slate-700">
                          Start Webcam
                       </button>
                    </div>
                    {cameraError && (
                       <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 max-w-md flex flex-col items-center">
                          <span className="font-bold text-red-300 block mb-1">Webcam permission denied</span>
                          <span className="text-center">{cameraError}</span>
                       </div>
                    )}
                    
                    <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-lg max-w-md text-xs text-slate-400 flex flex-col gap-2 items-center text-center">
                       <div className="flex items-center gap-2 text-slate-300 font-bold mb-1"><AlertTriangle size={14} className="text-yellow-500" /> Embedded Preview Note</div>
                       <p>Webcam testing is currently disabled in preview. Use Upload Video or Local Demo Clips.</p>
                    </div>
                </div>
             )}

             {hasVideoSource && (
                 <div className="relative w-full h-full flex items-center justify-center">
                    {sourceType === 'video' ? (
                       <video 
                          id="static-video"
                          ref={videoRef} key={activeTab === 'webcam' ? 'webcam' : (previewUrl || 'none')} 
                          src={activeTab === 'webcam' ? undefined : previewUrl!} 
                          controls={activeTab !== 'webcam'}
                          playsInline
                          preload="metadata"
                          autoPlay
                          loop
                          crossOrigin="anonymous"
                          className="max-w-full max-h-full object-contain absolute inset-0 w-full h-full webcam-video"
                          onPlay={() => setIsAutoAnalyzing(false)} // Give user choice
                          onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              if (target.error) {
                                  const event = new CustomEvent('show-toast', { detail: 'Could not play video. Please ensure it is a valid MP4, WebM or MOV.' });
                                  window.dispatchEvent(event);
                              }
                          }}
                       />
                    ) : (
                       <img id="static-image" src={previewUrl!} className="max-w-full max-h-full object-contain absolute inset-0 w-full h-full mx-auto" alt="Preview" />
                    )}
                    
                    {canvasRef && hasVideoSource && (
                       <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                    )}

                    <div className="absolute top-4 right-4 bg-black/80 p-3 rounded-xl text-[10px] text-slate-300 backdrop-blur border border-white/10 flex flex-col gap-1 w-56 z-50 shadow-2xl">
                        {activeTab === 'webcam' ? (
                           <>
                              <div className="border-b border-slate-700 pb-1 mb-1 font-bold text-slate-100 uppercase tracking-widest text-[9px]">Source Info</div>
                              <div className="flex justify-between"><span>Type:</span> <span className="text-blue-400">Live Webcam</span></div>
                              <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400">Connected</span></div>
                              <div className="flex justify-between"><span>Mode:</span> <span className="text-blue-400">{isAutoAnalyzing ? "Monitoring" : "Idle"}</span></div>
                           </>
                        ) : (
                           <>
                              <div className="border-b border-slate-700 pb-1 mb-1 font-bold text-slate-100 uppercase tracking-widest text-[9px]">Source Info</div>
                              <div className="flex justify-between"><span>Type:</span> <span className="text-blue-400">{sourceType === 'video' ? 'Video' : 'Static Image'}</span></div>
                              <div className="flex justify-between"><span>Objects:</span> <span className="text-blue-400">{results?.detections.length || 0}</span></div>
                              <div className="flex justify-between"><span>Mode:</span> <span className="text-blue-400">{isAutoAnalyzing ? "Scanning" : "Ready"}</span></div>
                           </>
                        )}
                    </div>

                    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 flex-wrap px-4">
                       {sourceType === 'video' ? (
                          <>
                             {webcamActive && (
                                <button onClick={stopWebcam} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-full font-bold text-sm shadow-lg transition-colors">
                                   Stop Webcam
                                </button>
                             )}
                             
                             {isAutoAnalyzing ? (
                                 <button 
                                    onClick={() => setIsAutoAnalyzing(false)}
                                    className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg backdrop-blur-md border transition-colors bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30"
                                 >
                                    <StopCircle size={18} /> Stop Detection
                                 </button>
                             ) : (
                                 <button 
                                    id="btn-start-analysis"
                                    onClick={() => setIsAutoAnalyzing(true)}
                                    disabled={webcamActive && (!videoRef.current || videoRef.current.readyState < 2)}
                                    className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg backdrop-blur-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600/90 text-white border-emerald-400/50 hover:bg-emerald-500"
                                 >
                                    <PlayCircle size={18} /> Start Detection
                                 </button>
                             )}
                             
                             <button 
                                onClick={() => performAnalysis(false)}
                                disabled={isAnalyzing || (webcamActive && (!videoRef.current || videoRef.current.readyState < 2))}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 border border-blue-400/50 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-colors"
                             >
                                {isAnalyzing ? <><Loader2 size={18} className="animate-spin" /> Processing</> : <><CameraIcon size={18} /> Analyze Frame</>}
                             </button>

                             {(webcamActive && (!videoRef.current || videoRef.current.readyState < 2)) && (
                                <span className="text-xs text-red-400 bg-black/80 p-1.5 rounded self-center">Start webcam first.</span>
                             )}
                          </>
                       ) : (
                          <button 
                             onClick={() => performAnalysis(false)}
                             disabled={isAnalyzing}
                             className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 border border-blue-400/50 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-colors"
                          >
                             {isAnalyzing ? <><Loader2 size={18} className="animate-spin" /> Processing</> : <><CameraIcon size={18} /> Analyze Frame</>}
                          </button>
                       )}
                    </div>
                 </div>
             )}
         </div>

         {/* Event Summary Banner */}
         {results && results.events.length > 0 && (
             <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 shadow-lg">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 border border-red-500/30 text-red-500">
                   <AlertTriangle size={24} />
                </div>
                <div>
                   <h3 className="text-red-400 font-bold text-base leading-tight">Review Recommended</h3>
                   <p className="text-slate-400 text-sm">{results.events[0].message}</p>
                </div>
             </div>
         )}
         
         {results && results.events.length === 0 && (
             <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/30 text-emerald-500">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 className="text-emerald-400 font-bold text-base leading-tight">Scene Stable</h3>
                   <p className="text-slate-400 text-sm">VisionGuard did not detect any events requiring immediate attention.</p>
                </div>
             </div>
         )}

         {/* Alert History Timeline (Bottom) */}
         <div className="h-[220px] shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 shrink-0 italic">Recent Event History</h3>
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-2">
               {timeline.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                     <p className="font-semibold text-slate-400">No events yet</p>
                     <p className="mt-1">Start detection on a video to generate event history.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                     {timeline.map((t, i) => (
                       <div key={i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg flex flex-col relative overflow-hidden group hover:border-slate-700 transition-colors">
                          {t.events.some(e=>e.severity==='Critical') && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                          {t.events.some(e=>e.severity==='High') && !t.events.some(e=>e.severity==='Critical') && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />}
                          
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{(t.timestamp || 0).toFixed(1)}s mark</span>
                             </div>
                             <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest",
                                 t.events[0].severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                 t.events[0].severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                             )}>
                                {t.events[0].severity}
                             </span>
                          </div>
                          <p className="text-sm text-slate-200 font-bold leading-tight mb-1">{t.events[0].type}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{t.events[0].message}</p>
                       </div>
                    ))}
                  </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}


