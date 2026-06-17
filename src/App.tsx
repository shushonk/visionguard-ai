import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { AnalysisView } from './components/AnalysisView';
import { CamerasView } from './components/CamerasView';
import { AlertsView } from './components/AlertsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ZonesView } from './components/ZonesView';
import { SettingsView } from './components/SettingsView';
import { Activity, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'analysis':
        return <AnalysisView />;
      case 'cameras':
        return <CamerasView />;
      case 'alerts':
        return <AlertsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'zones':
        return <ZonesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
            <Activity className="text-slate-600 mb-4" size={32} />
            <h2 className="text-lg font-medium text-slate-300 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-slate-500 mt-2">This module is currently initializing or under maintenance.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow effect in background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <Topbar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white capitalize">{activeTab.replace('-', ' ')}</h1>
                <p className="text-sm text-slate-400 mt-1">
                  {activeTab === 'analysis' && "Upload and analyze individual frames using the neural engine."}
                  {activeTab === 'dashboard' && "Overview of system status and recent security events."}
                  {activeTab === 'cameras' && "Live feed monitoring and active tracking overlays."}
                  {activeTab !== 'analysis' && activeTab !== 'dashboard' && activeTab !== 'cameras' && "Module telemetry and configuration."}
                </p>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded-lg shadow-xl border border-slate-700 font-medium z-50 flex items-center gap-3"
          >
            <Bell size={18} className="text-blue-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
