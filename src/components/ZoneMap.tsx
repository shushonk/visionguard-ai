import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Camera, Globe, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';

const defaultCenter: [number, number] = [20, 0];
const defaultZoom = 2;

const globalSites = [
  { id: "SITE-01", name: "Bengaluru Command Site", country: "India", lat: 12.9716, lng: 77.5946, cameras: 128, risk: "High", alerts: 6, status: "active" },
  { id: "SITE-02", name: "Mumbai Port Security", country: "India", lat: 19.0760, lng: 72.8777, cameras: 92, risk: "High", alerts: 4, status: "active" },
  { id: "SITE-03", name: "Delhi Metro Hub", country: "India", lat: 28.6139, lng: 77.2090, cameras: 110, risk: "Medium", alerts: 3, status: "active" },
  { id: "SITE-04", name: "New York Security Hub", country: "USA", lat: 40.7128, lng: -74.0060, cameras: 96, risk: "Medium", alerts: 2, status: "active" },
  { id: "SITE-05", name: "Los Angeles Traffic Center", country: "USA", lat: 34.0522, lng: -118.2437, cameras: 84, risk: "Medium", alerts: 3, status: "active" },
  { id: "SITE-06", name: "London Surveillance Node", country: "UK", lat: 51.5074, lng: -0.1278, cameras: 74, risk: "Medium", alerts: 2, status: "active" },
  { id: "SITE-07", name: "Berlin Industrial Site", country: "Germany", lat: 52.5200, lng: 13.4050, cameras: 67, risk: "Medium", alerts: 1, status: "active" },
  { id: "SITE-08", name: "Paris Transit Security", country: "France", lat: 48.8566, lng: 2.3522, cameras: 72, risk: "Medium", alerts: 2, status: "active" },
  { id: "SITE-09", name: "Dubai Critical Facility", country: "UAE", lat: 25.2048, lng: 55.2708, cameras: 88, risk: "Critical", alerts: 7, status: "active" },
  { id: "SITE-10", name: "Singapore Port Security", country: "Singapore", lat: 1.3521, lng: 103.8198, cameras: 115, risk: "High", alerts: 5, status: "active" },
  { id: "SITE-11", name: "Tokyo Smart City Zone", country: "Japan", lat: 35.6762, lng: 139.6503, cameras: 142, risk: "Low", alerts: 1, status: "active" },
  { id: "SITE-12", name: "Seoul Smart Campus", country: "South Korea", lat: 37.5665, lng: 126.9780, cameras: 61, risk: "Low", alerts: 0, status: "active" },
  { id: "SITE-13", name: "Sydney Campus Zone", country: "Australia", lat: -33.8688, lng: 151.2093, cameras: 54, risk: "Low", alerts: 0, status: "active" },
  { id: "SITE-14", name: "Johannesburg Logistics Site", country: "South Africa", lat: -26.2041, lng: 28.0473, cameras: 48, risk: "High", alerts: 3, status: "active" },
  { id: "SITE-15", name: "São Paulo Retail Security", country: "Brazil", lat: -23.5505, lng: -46.6333, cameras: 59, risk: "Medium", alerts: 2, status: "active" },
  { id: "SITE-16", name: "Toronto Facility Watch", country: "Canada", lat: 43.6532, lng: -79.3832, cameras: 64, risk: "Low", alerts: 1, status: "active" },
  { id: "SITE-17", name: "Riyadh Government Facility", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, cameras: 79, risk: "High", alerts: 4, status: "active" },
  { id: "SITE-18", name: "Bangkok Mall Security", country: "Thailand", lat: 13.7563, lng: 100.5018, cameras: 52, risk: "Medium", alerts: 2, status: "active" },
  { id: "SITE-19", name: "Nairobi Campus Safety", country: "Kenya", lat: -1.2921, lng: 36.8219, cameras: 41, risk: "Medium", alerts: 1, status: "active" },
  { id: "SITE-20", name: "Amsterdam Airport Zone", country: "Netherlands", lat: 52.3676, lng: 4.9041, cameras: 86, risk: "High", alerts: 3, status: "active" },
];

const globalZones = [
  // Bengaluru
  { id: "Z-1", siteId: "SITE-01", name: "Main Gate Restricted Zone", type: "Restricted Area", risk: "Critical", color: "#ef4444", coords: [[12.973, 77.593], [12.973, 77.596], [12.970, 77.596], [12.970, 77.593]] as [number, number][] },
  { id: "Z-2", siteId: "SITE-01", name: "Warehouse Intrusion Zone", type: "Intrusion", risk: "High", color: "#f97316", coords: [[12.976, 77.591], [12.976, 77.594], [12.973, 77.594], [12.973, 77.591]] as [number, number][] },
  { id: "Z-3", siteId: "SITE-01", name: "Parking No-Stop Zone", type: "No Parking", risk: "Medium", color: "#eab308", coords: [[12.972, 77.590], [12.972, 77.592], [12.970, 77.592], [12.970, 77.590]] as [number, number][] },
  { id: "Z-4", siteId: "SITE-01", name: "Server Room Staff Only Zone", type: "Staff Only", risk: "Critical", color: "#ef4444", coords: [[12.975, 77.595], [12.975, 77.596], [12.974, 77.596], [12.974, 77.595]] as [number, number][] },
  { id: "Z-5", siteId: "SITE-01", name: "Emergency Exit Path", type: "Emergency Exit", risk: "High", color: "#f97316", coords: [[12.971, 77.591], [12.971, 77.593], [12.970, 77.593], [12.970, 77.591]] as [number, number][] },
  // Mumbai
  { id: "Z-6", siteId: "SITE-02", name: "Port Loading Zone", type: "Loading Zone", risk: "High", color: "#f97316", coords: [[19.078, 72.875], [19.078, 72.879], [19.074, 72.879], [19.074, 72.875]] as [number, number][] },
  { id: "Z-7", siteId: "SITE-02", name: "Dock Restricted Area", type: "Restricted Area", risk: "Critical", color: "#ef4444", coords: [[19.075, 72.876], [19.075, 72.880], [19.072, 72.880], [19.072, 72.876]] as [number, number][] },
  { id: "Z-8", siteId: "SITE-02", name: "Container Yard Zone", type: "Sensitive Asset Zone", risk: "Medium", color: "#eab308", coords: [[19.079, 72.870], [19.079, 72.874], [19.075, 72.874], [19.075, 72.870]] as [number, number][] },
  { id: "Z-9", siteId: "SITE-02", name: "No Parking Truck Lane", type: "No Parking", risk: "Medium", color: "#eab308", coords: [[19.073, 72.877], [19.073, 72.879], [19.070, 72.879], [19.070, 72.877]] as [number, number][] },
  // Delhi
  { id: "Z-10", siteId: "SITE-03", name: "Metro Entrance Crowd Zone", type: "Crowd Control Zone", risk: "High", color: "#f97316", coords: [[28.615, 77.207], [28.615, 77.211], [28.612, 77.211], [28.612, 77.207]] as [number, number][] },
  { id: "Z-11", siteId: "SITE-03", name: "Staff Only Control Room", type: "Staff Only", risk: "Critical", color: "#ef4444", coords: [[28.614, 77.208], [28.614, 77.210], [28.613, 77.210], [28.613, 77.208]] as [number, number][] },
  { id: "Z-12", siteId: "SITE-03", name: "Emergency Exit Corridor", type: "Emergency Exit", risk: "High", color: "#f97316", coords: [[28.612, 77.209], [28.612, 77.211], [28.610, 77.211], [28.610, 77.209]] as [number, number][] },
  // Dubai
  { id: "Z-13", siteId: "SITE-09", name: "Critical Facility Perimeter", type: "Perimeter Fence", risk: "Critical", color: "#ef4444", coords: [[25.206, 55.269], [25.206, 55.273], [25.202, 55.273], [25.202, 55.269]] as [number, number][] },
  { id: "Z-14", siteId: "SITE-09", name: "VIP Access Zone", type: "VIP Area", risk: "High", color: "#f97316", coords: [[25.205, 55.270], [25.205, 55.272], [25.204, 55.272], [25.204, 55.270]] as [number, number][] },
  { id: "Z-15", siteId: "SITE-09", name: "Fire Safety Zone", type: "Fire Safety Zone", risk: "Critical", color: "#ef4444", coords: [[25.203, 55.271], [25.203, 55.273], [25.201, 55.273], [25.201, 55.271]] as [number, number][] },
  { id: "Z-16", siteId: "SITE-09", name: "Server Room Critical Zone", type: "Server Room", risk: "Critical", color: "#ef4444", coords: [[25.205, 55.268], [25.205, 55.270], [25.203, 55.270], [25.203, 55.268]] as [number, number][] },
  // Singapore (SITE-10)
  { id: "Z-17", siteId: "SITE-10", name: "Port Loading Zone", type: "Loading Zone", risk: "High", color: "#f97316", coords: [[1.354, 103.817], [1.354, 103.822], [1.350, 103.822], [1.350, 103.817]] as [number, number][] },
  { id: "Z-18", siteId: "SITE-10", name: "Restricted Dock Area", type: "Restricted Area", risk: "Critical", color: "#ef4444", coords: [[1.352, 103.818], [1.352, 103.824], [1.348, 103.824], [1.348, 103.818]] as [number, number][] },
  { id: "Z-19", siteId: "SITE-10", name: "Forklift Path Zone", type: "Forklift Path", risk: "Medium", color: "#eab308", coords: [[1.355, 103.815], [1.355, 103.820], [1.351, 103.820], [1.351, 103.815]] as [number, number][] },
  { id: "Z-20", siteId: "SITE-10", name: "Warehouse Aisle Zone", type: "Warehouse Aisle", risk: "Low", color: "#06b6d4", coords: [[1.353, 103.816], [1.353, 103.819], [1.350, 103.819], [1.350, 103.816]] as [number, number][] },
  // New York (SITE-04)
  { id: "Z-21", siteId: "SITE-04", name: "Entrance Monitoring Zone", type: "Entry Gate", risk: "Medium", color: "#eab308", coords: [[40.714, -74.004], [40.714, -74.002], [40.712, -74.002], [40.712, -74.004]] as [number, number][] },
  { id: "Z-22", siteId: "SITE-04", name: "Parking Security Zone", type: "Parking Bay", risk: "Medium", color: "#eab308", coords: [[40.714, -74.008], [40.714, -74.004], [40.710, -74.004], [40.710, -74.008]] as [number, number][] },
  { id: "Z-23", siteId: "SITE-04", name: "Crowd Control Zone", type: "Crowd Control Zone", risk: "High", color: "#f97316", coords: [[40.712, -74.006], [40.712, -74.004], [40.710, -74.004], [40.710, -74.006]] as [number, number][] },
  // London (SITE-06)
  { id: "Z-24", siteId: "SITE-06", name: "Transit Gate Zone", type: "Entry Gate", risk: "Medium", color: "#eab308", coords: [[51.509, -0.130], [51.509, -0.126], [51.505, -0.126], [51.505, -0.130]] as [number, number][] },
  { id: "Z-25", siteId: "SITE-06", name: "Staff Corridor Zone", type: "Staff Only", risk: "High", color: "#f97316", coords: [[51.508, -0.129], [51.508, -0.127], [51.506, -0.127], [51.506, -0.129]] as [number, number][] },
  { id: "Z-26", siteId: "SITE-06", name: "Emergency Exit Zone", type: "Emergency Exit", risk: "Critical", color: "#ef4444", coords: [[51.507, -0.128], [51.507, -0.125], [51.505, -0.125], [51.505, -0.128]] as [number, number][] },
  // Tokyo (SITE-11)
  { id: "Z-27", siteId: "SITE-11", name: "Smart City Camera Coverage Zone", type: "Perimeter Fence", risk: "Low", color: "#06b6d4", coords: [[35.678, 139.648], [35.678, 139.652], [35.674, 139.652], [35.674, 139.648]] as [number, number][] },
  { id: "Z-28", siteId: "SITE-11", name: "Pedestrian Crowd Zone", type: "Crowd Control Zone", risk: "Medium", color: "#eab308", coords: [[35.677, 139.649], [35.677, 139.651], [35.675, 139.651], [35.675, 139.649]] as [number, number][] },
  { id: "Z-29", siteId: "SITE-11", name: "Traffic Monitoring Zone", type: "Loading Zone", risk: "Low", color: "#06b6d4", coords: [[35.676, 139.650], [35.676, 139.653], [35.673, 139.653], [35.673, 139.650]] as [number, number][] },
  // Johannesburg (SITE-14)
  { id: "Z-30", siteId: "SITE-14", name: "Logistics Loading Zone", type: "Loading Zone", risk: "High", color: "#f97316", coords: [[-26.202, 28.045], [-26.202, 28.049], [-26.206, 28.049], [-26.206, 28.045]] as [number, number][] },
  { id: "Z-31", siteId: "SITE-14", name: "Perimeter Fence Zone", type: "Perimeter Fence", risk: "High", color: "#f97316", coords: [[-26.201, 28.044], [-26.201, 28.050], [-26.207, 28.050], [-26.207, 28.044]] as [number, number][] },
  { id: "Z-32", siteId: "SITE-14", name: "Vehicle Checkpoint Zone", type: "Entry Gate", risk: "Medium", color: "#eab308", coords: [[-26.203, 28.046], [-26.203, 28.048], [-26.205, 28.048], [-26.205, 28.046]] as [number, number][] },
  // Amsterdam (SITE-20)
  { id: "Z-33", siteId: "SITE-20", name: "Airport Entry Gate Zone", type: "Entry Gate", risk: "High", color: "#f97316", coords: [[52.369, 4.902], [52.369, 4.906], [52.365, 4.906], [52.365, 4.902]] as [number, number][] },
  { id: "Z-34", siteId: "SITE-20", name: "Baggage Restricted Zone", type: "Restricted Area", risk: "Critical", color: "#ef4444", coords: [[52.368, 4.903], [52.368, 4.905], [52.366, 4.905], [52.366, 4.903]] as [number, number][] },
  { id: "Z-35", siteId: "SITE-20", name: "Crowd Queue Zone", type: "Crowd Control Zone", risk: "Medium", color: "#eab308", coords: [[52.367, 4.904], [52.367, 4.907], [52.364, 4.907], [52.364, 4.904]] as [number, number][] },
];

const createMarkerIcon = (risk: string) => {
  const color = risk === 'Critical' ? 'text-red-500' :
                risk === 'High' ? 'text-orange-500' :
                risk === 'Medium' ? 'text-yellow-500' :
                'text-cyan-500';
  
  const html = renderToStaticMarkup(
    <div className={`filter drop-shadow-md bg-slate-900 rounded-full p-1 border-2 ${risk === 'Critical'? 'border-red-500' : risk === 'High' ? 'border-orange-500' : risk === 'Medium' ? 'border-yellow-500' : 'border-cyan-500'}`}>
      <MapPin size={24} className={color} />
    </div>
  );
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

function MapControls({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-auto">
      <button 
        onClick={onReset}
        className="bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-300 p-2.5 rounded shadow-lg hover:bg-slate-800 transition-colors"
        title="Reset World View"
      >
        <Globe size={18} />
      </button>
    </div>
  );
}

function ZoomHandler({ center, zoom, shouldFly }: { center: [number, number], zoom: number, shouldFly: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (shouldFly) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, shouldFly, map]);
  return null;
}

export function ZoneMap() {
  const [activeSite, setActiveSite] = useState<any>(null);
  const [activeZone, setActiveZone] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [mapTarget, setMapTarget] = useState<{center: [number, number], zoom: number, shouldFly: boolean}>({
    center: defaultCenter, zoom: defaultZoom, shouldFly: false
  });

  const handleReset = () => {
    setActiveSite(null);
    setActiveZone(null);
    setSearchQuery("");
    setMapTarget({ center: defaultCenter, zoom: defaultZoom, shouldFly: true });
  };

  const handleSiteClick = (site: any) => {
    setActiveSite(site);
    setActiveZone(null);
    setMapTarget({ center: [site.lat, site.lng], zoom: 14, shouldFly: true });
  };
  
  const handleZoneClick = (zone: any, site: any) => {
      setActiveZone(zone);
      setActiveSite(site);
  };

  const filteredSites = globalSites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.country.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGlobalZones = globalZones.filter(z => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    z.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    globalSites.find(s => s.id === z.siteId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeZones = activeSite ? globalZones.filter(z => z.siteId === activeSite.id) : globalZones;

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 mb-1">Global Security Zones</h2>
           <p className="text-sm text-slate-400">Monitor cameras, restricted areas, and active risks across global sites.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Search global sites..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 w-64" />
           </div>
           <button className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium">
              <Filter size={16} /> Filter
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-xs uppercase font-mono text-slate-500">Global Sites</span>
             <span className="text-2xl font-bold text-slate-100">{globalSites.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-xs uppercase font-mono text-slate-500">Active Cameras</span>
             <span className="text-2xl font-bold text-slate-100">{globalSites.reduce((acc, s) => acc + s.cameras, 0)}</span>
          </div>
          <div className="bg-slate-900 border border-red-900/30 border-l-2 border-l-red-500 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-xs uppercase font-mono text-slate-500">Critical Zones</span>
             <span className="text-2xl font-bold text-slate-100">{globalZones.filter(z => z.risk === 'Critical').length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-xs uppercase font-mono text-slate-500">Alerts Today</span>
             <span className="text-2xl font-bold text-slate-100">{globalSites.reduce((acc, s) => acc + s.alerts, 0)}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-xs uppercase font-mono text-slate-500">Countries</span>
             <span className="text-2xl font-bold text-slate-100">{new Set(globalSites.map(s => s.country)).size}</span>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Left side: Map */}
        <div className="w-full lg:w-3/4 h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-xl z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={defaultZoom} 
            scrollWheelZoom={true} 
            className="w-full h-full bg-[#0a0f18] outline-none"
            zoomControl={true}
          >
            <ZoomHandler center={mapTarget.center} zoom={mapTarget.zoom} shouldFly={mapTarget.shouldFly} />
            <TileLayer
               attribution='&copy; <a href="https://carto.com/">Carto</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapControls onReset={handleReset} />

            {/* Sites Markers */}
            {filteredSites.map(site => (
               <Marker 
                 key={site.id}
                 position={[site.lat, site.lng]}
                 icon={createMarkerIcon(site.risk)}
                 eventHandlers={{ click: () => handleSiteClick(site) }}
               >
                  <Popup className="zone-popup">
                     <div className="font-bold text-slate-900 text-sm mb-1">{site.name}</div>
                     <div className="text-xs text-slate-600 mb-2">{site.country}</div>
                     <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between w-32 border-b pb-1">
                           <span className="text-slate-500 text-left">Cameras</span>
                           <span className="font-bold text-slate-800 text-right">{site.cameras}</span>
                        </div>
                        <div className="flex justify-between w-32">
                           <span className="text-slate-500 text-left">Alerts</span>
                           <span className="font-bold text-slate-800 text-right">{site.alerts}</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleSiteClick(site); }}
                       className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded"
                     >
                       Focus Site
                     </button>
                  </Popup>
               </Marker>
            ))}

            {/* Zones Polygons */}
            {activeZones.map(zone => (
              <Polygon 
                key={zone.id}
                positions={zone.coords} 
                pathOptions={{ 
                  color: zone.color, 
                  fillColor: zone.color, 
                  fillOpacity: 0.2, 
                  weight: 2,
                  dashArray: "4 4"
                }}
                eventHandlers={{
                  click: () => {
                     const parentSite = globalSites.find(s => s.id === zone.siteId);
                     handleZoneClick(zone, parentSite);
                  }
                }}
              >
                <Popup className="zone-popup">
                  <div className="text-slate-900 font-bold text-sm">{zone.name}</div>
                  <div className="text-slate-600 text-xs mt-1">Rule: <span className="font-medium">{zone.type}</span></div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[400] flex gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur p-2 rounded-lg border border-slate-700">
             <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</div>
             <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-orange-500"></div> High</div>
             <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium</div>
             <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Low</div>
          </div>
        </div>

        {/* Right side: Details Panel */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full bg-slate-900 border border-slate-800 p-4 rounded-xl">
           {!activeSite ? (
             <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 h-full p-4">
                <Globe size={32} className="mb-4 text-slate-700" />
                <h3 className="font-semibold text-slate-200 mb-2">Global Overview</h3>
                <p className="text-sm">Select a global site, camera, or zone on the map to view detailed metrics and configuration.</p>
             </div>
           ) : (
             <div className="flex flex-col h-full">
                <div className="mb-6">
                   <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-slate-100">{activeSite.name}</h2>
                   </div>
                   <p className="text-xs text-slate-400 flex items-center gap-1 mb-3"><MapPin size={12}/> {activeSite.country} • {activeSite.lat.toFixed(4)}, {activeSite.lng.toFixed(4)}</p>
                   
                   <div className="flex flex-wrap gap-2 mb-4">
                      <span className={cn("text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border", 
                          activeSite.risk === 'Critical' ? 'text-red-400 border-red-500/30 bg-red-400/10' :
                          activeSite.risk === 'High' ? 'text-orange-400 border-orange-500/30 bg-orange-400/10' :
                          activeSite.risk === 'Medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-400/10' :
                          'text-cyan-400 border-cyan-500/30 bg-cyan-400/10'
                      )}>{activeSite.risk} Risk Site</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border border-emerald-500/30 bg-emerald-400/10 text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[10px] uppercase text-slate-500 block mb-1">Cameras</span>
                      <span className="text-xl font-mono text-slate-200 font-bold">{activeSite.cameras}</span>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[10px] uppercase text-slate-500 block mb-1">Active Alerts</span>
                      <span className="text-xl font-mono text-slate-200 font-bold">{activeSite.alerts}</span>
                   </div>
                </div>

                {activeZone && (
                   <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6">
                      <h4 className="text-sm font-bold text-slate-200 mb-1">{activeZone.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">Rule: <span className="text-slate-300 font-medium">{activeZone.type}</span></p>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500">Violations Today</span>
                         <span className="font-bold text-slate-200">12</span>
                      </div>
                      <button className="w-full mt-3 border border-slate-600 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-1.5 rounded transition-colors">Edit Zone</button>
                   </div>
                )}
                
                {!activeZone && (
                   <div className="mb-6">
                      <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Configured Zones ({activeZones.length})</h4>
                      <div className="space-y-2">
                         {activeZones.length > 0 ? activeZones.map(z => (
                            <div key={z.id} onClick={() => handleZoneClick(z, activeSite)} className="p-2 border border-slate-800 bg-slate-950 hover:border-slate-600 cursor-pointer rounded-lg text-xs transition-colors flex justify-between items-center text-slate-300">
                               <span>{z.name}</span>
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: z.color}}></div>
                            </div>
                         )) : <div className="text-xs text-slate-500">No zones configured for this site.</div>}
                      </div>
                   </div>
                )}

                <div className="mt-auto space-y-2">
                   <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Camera Grid view opened for site.' }))}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded shadow transition-colors flex items-center justify-center gap-2"
                   >
                      <Camera size={16}/> View Camera Grid
                   </button>
                   <div className="flex gap-2">
                      <button 
                         onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Navigating to alerts for this site.' }))}
                         className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded transition-colors"
                      >
                         Open Alerts
                      </button>
                      <button 
                         onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Add Zone tool activated.' }))}
                         className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded transition-colors"
                      >
                         Add Zone
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Bottom Global Zones Table */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-lg overflow-hidden shrink-0 mt-4">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Global Configured Zones</h3>
              <div className="text-xs text-slate-500 font-mono text-right">{globalZones.length} Active Zones</div>
          </div>
          <div className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                    <tr className="bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest border-b border-slate-800">
                       <th className="p-3 pl-4">Zone ID</th>
                       <th className="p-3">Zone Name</th>
                       <th className="p-3">Site / Country</th>
                       <th className="p-3">Type</th>
                       <th className="p-3 text-center">Risk Level</th>
                       <th className="p-3 text-right pr-4">View</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-slate-800/50">
                    {filteredGlobalZones.slice(0, 100).map((z, idx) => {
                       const site = globalSites.find(s => s.id === z.siteId);
                       return (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                             <td className="p-3 pl-4 font-mono text-xs text-slate-500">{z.id}</td>
                             <td className="p-3 text-slate-200 font-medium">{z.name}</td>
                             <td className="p-3 text-slate-400 text-xs">
                                {site ? <span className="flex items-center gap-1"><MapPin size={10} /> {site.name}, {site.country}</span> : 'Unknown'}
                             </td>
                             <td className="p-3 text-slate-400 text-xs">{z.type}</td>
                             <td className="p-3 text-center">
                                <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded", 
                                  z.risk === 'Critical' ? 'text-red-400 bg-red-400/10' :
                                  z.risk === 'High' ? 'text-orange-400 bg-orange-400/10' :
                                  z.risk === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                                  'text-blue-400 bg-blue-400/10'
                                )}>{z.risk}</span>
                             </td>
                             <td className="p-3 pr-4 text-right">
                                <button
                                   onClick={() => {
                                      if (site) handleZoneClick(z, site);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                   }}
                                   className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                   Inspect
                                </button>
                             </td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}

