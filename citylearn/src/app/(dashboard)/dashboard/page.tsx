// @ts-nocheck
"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { loadUnifiedAnalysis, fetchDashboardMetrics } from "@/lib/analysis";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";

export default function Page() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTrendTab, setActiveTrendTab] = useState<"daily" | "category">("daily");
  const leafletMapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [analysis, dbData] = await Promise.all([
          loadUnifiedAnalysis(),
          fetchDashboardMetrics()
        ]);
        
        const combined = {
          ...dbData,
          ...(analysis?.dashboard_metrics || {})
        };
        setMetrics(combined);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();

    // Neural Matrix randomization
    const interval = setInterval(() => {
      const bars = document.querySelectorAll(".neural-matrix-bar");
      bars.forEach((bar) => {
        if (Math.random() > 0.85) {
          bar.classList.add("bg-primary/20");
          setTimeout(() => bar.classList.remove("bg-primary/20"), 500);
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !metrics) return;

    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
      leafletMapInstanceRef.current = null;
    }

    const lat = metrics.active_latitude || 12.9716;
    const lon = metrics.active_longitude || 77.5946;

    const L = window.L;
    if (!L) return;

    const map = L.map("dashboard-map").setView([lat, lon], 13);
    leafletMapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const severityColor = metrics.active_severity === "High" ? "red" : "blue";
    const markerIconUrl = severityColor === "red" 
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";

    const customIcon = L.icon({
      iconUrl: markerIconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px; width: 140px;">
        <b style="font-size: 12px; color: #1e293b;">${metrics.active_event_type || "Event"}</b><br>
        <span style="color: #64748b;">Location: ${metrics.active_location || "Active Corridor"}</span><br>
        <span style="color: ${severityColor === "red" ? "#dc2626" : "#2563eb"}; font-weight: bold;">Severity: ${metrics.active_severity || "Low"}</span>
      </div>
    `).openPopup();

    const offsets = [
      [0.003, -0.004, "Sensor Node A - Active"],
      [-0.004, 0.005, "Sensor Node B - Active"],
      [0.006, 0.002, "Sensor Node C - Standby"]
    ];

    offsets.forEach(([dLat, dLon, label]) => {
      const sensorIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [18, 30],
        iconAnchor: [9, 30],
        popupAnchor: [1, -30],
        shadowSize: [30, 30]
      });
      L.marker([lat + dLat, lon + dLon], { icon: sensorIcon }).addTo(map).bindPopup(label);
    });
  }, [mapLoaded, metrics]);

  // Compute stats safely
  const totalEvents = metrics ? metrics.total_events : null;
  const eventsAnalyzed = metrics ? metrics.predictions_count : null;
  const similarityCount = metrics ? metrics.similarity_count : null;
  const activeEvents = metrics ? Math.max(0, totalEvents - metrics.resolved_events_count) : null;
  const criticalAlerts = metrics ? Object.keys(metrics.high_risk_zones || {}).length : null;
  
  // Risk index calculations
  const riskPercent = metrics ? Math.round((metrics.active_congestion || 0) * 10) : null;
  const riskLabel = riskPercent > 70 ? "Elevated" : riskPercent > 40 ? "Moderate" : "Low";

  const avgResolutionTime = metrics ? metrics.avg_resolution_time : null;
  const recentActivities = metrics ? metrics.recent_activities : [];
  const congestionMatrix = metrics ? metrics.congestion_matrix : [];

  const weekdayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekdayData = metrics ? weekdayOrder.map(day => ({
    name: day.slice(0, 3),
    events: metrics.event_trends?.[day] || 0,
    baseline: Math.round((metrics.event_trends?.[day] || 0) * 0.85)
  })) : [];

  const categoryData = metrics ? Object.entries(metrics.event_types_distribution || {}).map(([key, val]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    count: val
  })).sort((a, b) => b.count - a.count) : [];

  const congestionData = metrics ? (metrics.congestion_matrix || []).map((val: number, idx: number) => {
    const isPeak = (7 <= idx && idx <= 10) || (16 <= idx && idx <= 20);
    return {
      hour: `${String(idx).padStart(2, "0")}:00`,
      intensity: val,
      period: isPeak ? "Peak" : "Off-Peak"
    };
  }) : [];


  if (!metrics && !isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
          }
        ` }} />
        <div className="space-y-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
          <div className="max-w-2xl text-center space-y-6 bg-white border border-border p-12 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <h1 className="font-merriweather text-3xl font-extrabold text-foreground leading-tight">
              Activate Urban Intelligence
            </h1>
            <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Welcome to <span className="citylearn-brand text-primary">CityLearn</span>. The dashboard is currently waiting for urban data. Run your first event neural synthesis to generate predictions, check congestion levels, and access resource planning tools.
            </p>
            <div className="pt-4">
              <Link
                href="/analysis-engine"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">science</span>
                Run Event Analysis Now
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.2); border-radius: 10px; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      ` }} />
      
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section 
          id="dashboard-hero" 
          className="relative h-64 md:h-72 rounded-2xl overflow-hidden flex items-center px-8 md:px-12 bg-cover bg-center border border-border"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000')"
          }}
        >
          <div className="relative z-10 max-w-2xl space-y-3">
            <h1 className="font-merriweather text-3xl md:text-4xl text-foreground tracking-tight leading-none font-bold">
              Cities Forget. <br/>
              <span className="font-merriweather text-primary font-extrabold">
                <span className="citylearn-brand">CityLearn</span> Remembers.
              </span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-muted-foreground max-w-lg leading-relaxed">
              Advanced urban intelligence mapping trillions of historical data points to predict and optimize city infrastructure.
            </p>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-border p-6 rounded-2xl border-l-4 border-l-primary shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">Active Database</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans mb-1">Events Learned</h3>
            <p className="font-display text-2xl font-bold text-foreground">
              {isLoading ? "..." : totalEvents !== null ? totalEvents.toLocaleString() : "-"}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-border p-6 rounded-2xl border-l-4 border-l-secondary shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary text-2xl">psychology</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Live Sessions</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans mb-1">Predictions Generated</h3>
            <p className="font-display text-2xl font-bold text-foreground">
              {isLoading ? "..." : eventsAnalyzed !== null ? eventsAnalyzed.toLocaleString() : "-"}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-border p-6 rounded-2xl border-l-4 border-l-accent shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-accent text-2xl">verified_user</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">Risk averted</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans mb-1">Similarity Matches</h3>
            <p className="font-display text-2xl font-bold text-foreground">
              {isLoading ? "..." : similarityCount !== null ? similarityCount.toLocaleString() : "-"}
            </p>
          </div>

        </section>

        {/* KPI Cards & Charts Bento */}

        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* KPIs Column */}
          <div className="md:col-span-3 space-y-4">
            
            <div className="bg-white border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Incidents</span>
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl font-bold text-foreground">
                  {isLoading ? "..." : activeEvents !== null ? activeEvents : "-"}
                </span>
                <div className="flex -space-x-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[8px] font-bold border-2 border-white">EV</span>
                  <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[8px] font-bold border-2 border-white">TR</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-5 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-l-destructive shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Critical Sectors</span>
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl font-bold text-destructive">
                  {isLoading ? "..." : criticalAlerts !== null ? criticalAlerts : "-"}
                </span>
                <span className="material-symbols-outlined text-destructive text-xl">warning</span>
              </div>
            </div>

            <div className="bg-white border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Predicted Risk Index</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {isLoading ? "..." : riskPercent !== null ? `${riskPercent}%` : "-"}
                  </span>
                  <span className="text-accent text-[10px] font-bold uppercase tracking-wider">
                    {riskPercent !== null ? riskLabel : "-"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full" style={{ width: `${riskPercent || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-5 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Avg Resolution Time</span>
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl font-bold text-foreground">
                  {isLoading ? "..." : avgResolutionTime !== null ? <>{Math.round(avgResolutionTime)}<span className="text-sm font-sans font-normal text-muted-foreground">m</span></> : "-"}
                </span>
                <span className="material-symbols-outlined text-muted-foreground text-xl">timer</span>
              </div>
            </div>

          </div>

          {/* Interactive Map Section */}
          <div className="md:col-span-6 bg-white border border-border rounded-2xl relative overflow-hidden shadow-sm flex flex-col h-full">
            <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-border shadow-sm">
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                <span className="text-[9px] font-bold text-foreground tracking-wider uppercase font-sans">Active Event Hotspots</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 z-[500]">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-border space-y-1.5 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-destructive rounded-full"></div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Active Blockade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Sensor Node</span>
                </div>
              </div>
            </div>

            <div id="dashboard-map" className="w-full h-full flex-grow min-h-[400px] md:min-h-0" style={{ zIndex: 10 }} />
          </div>

          {/* Recent Activities Section */}
          <div className="md:col-span-3 bg-gradient-to-b from-white to-slate-50/50 border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">history</span>
                Recent Activities
              </h3>
            </div>
            
            <div className="flex-grow flex flex-col justify-between gap-3 overflow-y-auto pr-1">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act: any) => {
                  let dotColor = "bg-primary";
                  let textColor = "text-primary";
                  let bgGradient = "from-primary/[0.04] to-transparent";
                  let borderTheme = "border-primary/10 hover:border-primary/30";
                  let icon = "event";
                  
                  const cleanEventType = (act.event_type || "")
                    .replace(/unplanned/gi, "")
                    .replace(/^\s*[-—:\s]+\s*|\s*[-—:\s]+\s*$/g, "")
                    .trim();
                  
                  const cleanDescription = (act.description || "")
                    .replace(/unplanned/gi, "")
                    .trim();

                  const eventTypeLower = cleanEventType.toLowerCase();
                  if (eventTypeLower.includes("assembly") || eventTypeLower.includes("concert")) {
                    dotColor = "bg-primary";
                    textColor = "text-primary";
                    bgGradient = "from-primary/[0.04] to-transparent";
                    borderTheme = "border-primary/10 hover:border-primary/30";
                    icon = "groups";
                  } else if (eventTypeLower.includes("sports") || eventTypeLower.includes("surge") || eventTypeLower.includes("transit")) {
                    dotColor = "bg-secondary";
                    textColor = "text-secondary";
                    bgGradient = "from-secondary/[0.04] to-transparent";
                    borderTheme = "border-secondary/10 hover:border-secondary/30";
                    icon = "directions_transit";
                  } else if (eventTypeLower.includes("failure") || eventTypeLower.includes("accident") || eventTypeLower.includes("closure")) {
                    dotColor = "bg-violet-500";
                    textColor = "text-violet-600";
                    bgGradient = "from-violet-500/[0.04] to-transparent";
                    borderTheme = "border-violet-200/50 hover:border-violet-300";
                    icon = "warning";
                  } else {
                    dotColor = "bg-cyan-500";
                    textColor = "text-cyan-600";
                    bgGradient = "from-cyan-500/[0.04] to-transparent";
                    borderTheme = "border-cyan-200/50 hover:border-cyan-300";
                    icon = "sensors";
                  }

                  return (
                    <div 
                      key={act.id} 
                      className={`group/item relative flex flex-col p-3 rounded-xl border ${borderTheme} bg-gradient-to-r ${bgGradient} hover:shadow-sm transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[12px] text-muted-foreground/60">{icon}</span>
                          <span className="text-[9px] font-mono font-bold text-muted-foreground">{act.time || "12:00"}</span>
                        </div>
                        <span className={`text-[8px] font-bold tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-full ${dotColor} bg-opacity-10 ${textColor}`}>
                          {cleanEventType}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-semibold leading-normal pr-1">
                        {cleanDescription}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground font-sans">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        <span className="truncate max-w-[170px]">{act.corridor}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center py-12 text-center gap-2">
                  <span className="material-symbols-outlined text-muted-foreground text-3xl">inbox</span>
                  <p className="text-xs text-muted-foreground font-mono">No recent activities recorded.</p>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Trend Chart */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Event Trends</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">Historical traffic incident trends</p>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setActiveTrendTab("daily")}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all uppercase tracking-wider ${
                    activeTrendTab === "daily" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setActiveTrendTab("category")}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all uppercase tracking-wider ${
                    activeTrendTab === "category" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Category
                </button>
              </div>
            </div>
            
            <div className="h-44 w-full relative">
              {activeTrendTab === "daily" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekdayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eventTrendsGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "10px", fontWeight: "bold" }} />
                    <Area type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#eventTrendsGrad)" name="Events" />
                    <Area type="monotone" dataKey="baseline" stroke="hsl(var(--secondary))" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="Baseline" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 7, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "10px", fontWeight: "bold" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Incidents">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Congestion Matrix */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Congestion Matrix</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">24-hour incident density heatmap</p>
              </div>
              <div className="flex gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Peak Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span>Off-Peak</span>
                </div>
              </div>
            </div>
            
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={congestionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 7, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "10px", fontWeight: "bold" }}
                    formatter={(value: any, name: any, props: any) => [value, `${props.payload.period} Density`]}
                  />
                  <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
                    {congestionData.map((entry, index) => {
                      const isPeak = (7 <= index && index <= 10) || (16 <= index && index <= 20);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isPeak ? "hsl(var(--primary))" : "rgba(148, 163, 184, 0.3)"} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {!isLoading && congestionData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-mono">Run an event analysis to populate congestion history.</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">Peak Sensor Node</span>
                <span className="text-xs font-semibold text-foreground">{metrics ? `${metrics.active_location || 'Corridor A'} - ${metrics.active_severity || 'High'}` : "-"}</span>
              </div>
            </div>
          </div>

        </section>

      </div>
    </>
  );
}
