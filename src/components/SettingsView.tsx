import React, { useState } from "react";
import { Save, Shield, BellRing, Camera, Sliders, Database, MonitorSmartphone } from "lucide-react";
import { cn } from "../lib/utils";

export function SettingsView() {
  const [activeMenu, setActiveMenu] = useState("ai");
  const defaultSettings = { confidence: 60, fps: 1, crowdSize: 5, rules: [true, true, true, true] };
  const [settings, setSettings] = useState(defaultSettings);

  const handleSave = () => {
      const event = new CustomEvent('show-toast', { detail: 'Settings saved.' });
      window.dispatchEvent(event);
  };
  const handleReset = () => {
      setSettings(defaultSettings);
      const event = new CustomEvent('show-toast', { detail: 'Settings reset.' });
      window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-8rem)]">
      
      {/* Settings Navigation */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
        {[
          { id: "ai", label: "AI Detection", icon: Sliders },
          { id: "camera", label: "Camera", icon: Camera },
          { id: "alerts", label: "Alerts", icon: BellRing },
          { id: "ui", label: "UI", icon: MonitorSmartphone },
          { id: "system", label: "System", icon: Database },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
              activeMenu === item.id 
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm" 
                : "text-slate-400 hover:bg-slate-900 border border-transparent hover:border-slate-800"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
         
         <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <div>
               <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {activeMenu === 'ai' && <><Sliders className="text-blue-500"/> AI Detection Configuration</>}
                  {activeMenu === 'camera' && <><Camera className="text-blue-500"/> Camera Settings</>}
                  {activeMenu === 'alerts' && <><BellRing className="text-blue-500"/> Alerts Configuration</>}
                  {activeMenu === 'ui' && <><MonitorSmartphone className="text-blue-500"/> UI Preferences</>}
                  {activeMenu === 'system' && <><Database className="text-blue-500"/> System Status</>}
               </h2>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={handleReset} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-bold rounded-lg shadow-md transition-colors">
                  Reset Defaults
               </button>
               <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 transition-colors">
                  <Save size={16} /> Save Configuration
               </button>
            </div>
         </div>

         <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {activeMenu === 'ai' && (
               <div className="max-w-3xl space-y-8">
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">Detection Settings</h3>
                        <p className="text-slate-400 text-sm mb-6">Control how sensitive VisionGuard should be while analyzing video.</p>
                     </div>
                     <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-6">
                        <div className="flex flex-col gap-2">
                           <span className="text-sm text-slate-400 font-medium">Detection method</span>
                           <select className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm w-fit focus:border-blue-500 focus:outline-none">
                               <option>Basic Browser AI — works without API keys</option>
                           </select>
                           <p className="text-xs text-blue-400 font-bold mt-2">VisionGuard works without API keys. Webcam, uploaded videos, and local demo clips are analyzed in your browser.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
                           <span className="text-sm text-slate-400 w-48">How sure should AI be before creating an alert?</span>
                           <input type="range" min="10" max="100" value={settings.confidence} onChange={(e) => setSettings({...settings, confidence: parseInt(e.target.value)})} className="flex-1 accent-blue-500" />
                           <span className="text-sm font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{settings.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-sm text-slate-400 w-48">Frame sampling rate</span>
                           <input type="range" min="1" max="10" value={settings.fps} onChange={(e) => setSettings({...settings, fps: parseInt(e.target.value)})} className="flex-1 accent-blue-500" />
                           <span className="text-sm font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{settings.fps} fps</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-sm text-slate-400 w-48">How many people count as a crowd?</span>
                           <input type="range" min="2" max="50" value={settings.crowdSize} onChange={(e) => setSettings({...settings, crowdSize: parseInt(e.target.value)})} className="flex-1 accent-blue-500" />
                           <span className="text-sm font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{settings.crowdSize} people</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">What VisionGuard Should Watch For</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                           { idx: 0, name: "People entering monitored areas" },
                           { idx: 1, name: "Unattended bags or objects" },
                           { idx: 2, name: "Vehicles blocking restricted areas" },
                           { idx: 3, name: "Ask for human review when AI is unsure" },
                        ].map(rule => (
                           <label key={rule.name} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors">
                               <input 
                                   type="checkbox" 
                                   checked={settings.rules[rule.idx]} 
                                   onChange={(e) => {
                                       const newRules = [...settings.rules];
                                       newRules[rule.idx] = e.target.checked;
                                       setSettings({...settings, rules: newRules});
                                   }}
                                   className="mt-1 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" 
                               />
                               <div className="text-sm font-semibold text-slate-200">{rule.name}</div>
                           </label>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeMenu === 'camera' && (
               <div className="max-w-3xl space-y-6">
                   <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-sm text-slate-300">Default FPS</span>
                         <select className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-3 py-1.5 text-sm">
                            <option>15 FPS</option>
                            <option>30 FPS</option>
                         </select>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Resolution display</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Auto reconnect toggle</span>
                      </div>
                   </div>
               </div>
            )}

            {activeMenu === 'alerts' && (
               <div className="max-w-3xl space-y-6">
                   <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-6">
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Alert sound</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Critical alert priority</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Human review queue</span>
                      </div>
                   </div>
               </div>
            )}

            {activeMenu === 'ui' && (
               <div className="max-w-3xl space-y-6">
                   <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-6">
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Dark mode</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Compact mode</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-600" />
                         <span className="text-sm text-slate-300">Animations</span>
                      </div>
                   </div>
               </div>
            )}

            {activeMenu === 'system' && (
               <div className="max-w-3xl space-y-6">
                   <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-6">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                         <span className="text-sm text-slate-300">TensorFlow model status</span>
                         <span className="text-sm text-emerald-400 font-medium">Ready</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                         <span className="text-sm text-slate-300">Local detection status</span>
                         <span className="text-sm text-emerald-400 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                         <span className="text-sm text-slate-300">Browser camera permission</span>
                         <span className="text-sm text-slate-400">Not Requested</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                         <span className="text-sm text-slate-300">Storage usage</span>
                         <span className="text-sm font-mono text-slate-400">1.2 MB LocalStorage</span>
                      </div>
                   </div>
               </div>
            )}

         </div>
      </div>

    </div>
  );
}
