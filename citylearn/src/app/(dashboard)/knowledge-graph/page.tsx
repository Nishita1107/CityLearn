// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadUnifiedAnalysis } from "@/lib/analysis";

const DEFAULT_NODES = [
  { id: "node-1", label: "Summer Festival", icon: "festival", badge: "ROOT", badgeColor: "primary", x: "8%", y: "8%", desc: "Large public assembly event with 85,000 attendees. Triggers cascading city-wide effects.", impact: 95, delay: "12ms" },
  { id: "node-2", label: "Main St. Closure", icon: "block", badge: "CAUSE", badgeColor: "secondary", x: "52%", y: "10%", desc: "2.4km road closure from signal C12 to junction E7. Affects 3 arterial corridors.", impact: 78, delay: "18ms" },
  { id: "node-3", label: "Gridlock Cascade", icon: "traffic", badge: "IMPACT", badgeColor: "amber", x: "58%", y: "44%", desc: "Critical severity cascade across 6 sectors. Estimated 42-min delay window.", impact: 62, delay: "24ms" },
  { id: "node-4", label: "Neural Rerouting", icon: "route", badge: "STRATEGY", badgeColor: "primary", x: "10%", y: "60%", desc: "AI-optimized diversion across 4 alternate routes. 94% confidence in resolution.", impact: 81, delay: "8ms" },
  { id: "node-5", label: "Latency Reduced", icon: "task_alt", badge: "OUTCOME", badgeColor: "primary", x: "52%", y: "71%", desc: "18% efficiency gain achieved. Resolution logged to institutional memory EP-992.", impact: 92, delay: "4ms" },
  { id: "node-6", label: "EMS Pre-Deploy", icon: "emergency", badge: "PARALLEL", badgeColor: "red", x: "28%", y: "35%", desc: "Emergency services pre-positioned at 3 key intersections based on historical pattern.", impact: 70, delay: "15ms" },
  { id: "node-7", label: "Pattern Locked", icon: "memory", badge: "MEMORY", badgeColor: "secondary", x: "30%", y: "80%", desc: "Event fingerprint EP-992-C stored to vector memory for future similarity matching.", impact: 88, delay: "2ms" },
];

const EDGES = [
  ["node-1", "node-2"],
  ["node-1", "node-6"],
  ["node-2", "node-3"],
  ["node-3", "node-4"],
  ["node-4", "node-5"],
  ["node-6", "node-3"],
  ["node-5", "node-7"],
  ["node-1", "node-4"],
];

const SIM_SEQUENCE = ["node-1", "node-2", "node-6", "node-3", "node-4", "node-5", "node-7"];

type SimulationReportData = {
  eventType: string;
  location: string;
  officerCount: number;
  efficiencyGains: number;
  resolutionTime: number;
  similarityScore: number;
  activeId: string | number;
  mitigatedDelayDelta?: number;
  congestionBefore?: number;
  congestionAfter?: number;
};

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Record<string, HTMLElement>>({});
  
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [selectedNode, setSelectedNode] = useState(DEFAULT_NODES[0]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<SimulationReportData | null>(null);
  
  const [simActive, setSimActive] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [edges, setEdges] = useState<Array<{ d: string; fromId: string; toId: string }>>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const drawEdges = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newEdges: typeof edges = [];

    EDGES.forEach(([fromId, toId]) => {
      const fromEl = containerRef.current?.querySelector(`[data-id="${fromId}"]`);
      const toEl = containerRef.current?.querySelector(`[data-id="${toId}"]`);
      if (!fromEl || !toEl) return;
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;
      const midX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      newEdges.push({ d, fromId, toId });
    });
    setEdges(newEdges);
  }, []);

  useEffect(() => {
    const t = setTimeout(drawEdges, 150);
    window.addEventListener("resize", drawEdges);
    return () => { clearTimeout(t); window.removeEventListener("resize", drawEdges); };
  }, [drawEdges, zoom]);

  // Load last analysis on mount to populate dynamic nodes
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const stored = await loadUnifiedAnalysis();
        if (stored) {
          const predictions = stored.predictions || {};
          const recommendations = stored.recommendations || {};
          const eventAnalysis = stored.event_analysis || {};
          const eventType = eventAnalysis.event_type || "Public Assembly";
          const location = eventAnalysis.location || "Active Corridor";
          const attendance = eventAnalysis.input?.attendance || 50000;
          const roadClosureProb = Math.round(predictions.road_closure_probability * 100) || 78;
          const roadClosureRequired = predictions.road_closure_required ? "Closure Required" : "Passable Traffic";
          const congestionScore = Math.round(predictions.congestion_prediction * 10) || 62;
          const resolutionTime = predictions.resolution_prediction || 42;
          const officerCount = recommendations.officer_deployment?.officer_count || 12;
          const deploymentArea = recommendations.officer_deployment?.deployment_area || location;
          const barricadeRequired = recommendations.barricade_plan?.required ? "Required" : "Not Required";
          const efficiencyGains = recommendations.efficiency_gains || 18;
          const similarityScore = Math.round(stored.similar_events?.[0]?.similarity_score || 88);
          const activeId = stored.similar_events?.[0]?.id || "992";

          const dynamicNodes = [
            { id: "node-1", label: eventType, icon: eventType === "Infrastructure Failure" ? "engineering" : "festival", badge: "ROOT", badgeColor: "primary", x: "8%", y: "8%", desc: `Event of type '${eventType}' at ${location}. Estimated attendance: ${attendance.toLocaleString()} people.`, impact: 100, delay: "0ms" },
            { id: "node-2", label: roadClosureRequired, icon: "block", badge: "CAUSE", badgeColor: "secondary", x: "52%", y: "10%", desc: `Road closure status is predicted as '${predictions.road_closure_required ? 'Yes' : 'No'}' with ${roadClosureProb}% probability.`, impact: roadClosureProb, delay: "5m" },
            { id: "node-3", label: "Congestion Spike", icon: "traffic", badge: "IMPACT", badgeColor: "amber", x: "58%", y: "44%", desc: `Congestion severity score of ${predictions.congestion_prediction}/10 predicted. Peak delay of ${resolutionTime}m expected.`, impact: congestionScore, delay: "15m" },
            { id: "node-4", label: "Manpower Dispatch", icon: "route", badge: "STRATEGY", badgeColor: "primary", x: "10%", y: "60%", desc: `Recommended deployment of ${officerCount} officers to ${deploymentArea} for dynamic traffic management.`, impact: Math.min(100, officerCount * 4 + 30), delay: "8m" },
            { id: "node-5", label: "Diversion Active", icon: "task_alt", badge: "OUTCOME", badgeColor: "primary", x: "52%", y: "71%", desc: `Barricades: ${barricadeRequired}. Alternate rerouting initiated. ${efficiencyGains}% efficiency gains predicted.`, impact: 90 + Math.round(efficiencyGains / 10), delay: "12m" },
            { id: "node-6", label: "Safety Pre-Deploy", icon: "emergency", badge: "PARALLEL", badgeColor: "red", x: "28%", y: "35%", desc: `Emergency response services alerted for priority dispatch based on ${eventType} profile.`, impact: 70, delay: "6m" },
            { id: "node-7", label: "Pattern Locked", icon: "memory", badge: "MEMORY", badgeColor: "secondary", x: "30%", y: "80%", desc: `Event signature stored to vector memory with ${similarityScore}% similarity footprint. Reference ID: EP-${activeId}.`, impact: similarityScore, delay: "2ms" },
          ];
          setNodes(dynamicNodes);
          setSelectedNode(dynamicNodes[0]);
          
          const mitigatedDelayDelta = Math.round(resolutionTime * (efficiencyGains / 100));
          const congestionBefore = Math.round(predictions.congestion_prediction * 10) || 62;
          const congestionAfter = Math.max(10, congestionBefore - Math.round(efficiencyGains / 2));

          setReportData({
            eventType,
            location,
            officerCount,
            efficiencyGains,
            resolutionTime,
            similarityScore,
            activeId,
            mitigatedDelayDelta,
            congestionBefore,
            congestionAfter,
          });
        }
      } catch (err) {
        console.error("Failed to load knowledge graph data:", err);
      }
    };
    fetchAnalysis();
  }, []);

  // Simulation runner
  useEffect(() => {
    if (!simActive) return;
    if (simStep >= SIM_SEQUENCE.length) {
      setTimeout(() => { 
        setSimActive(false); 
        setSimStep(-1); 
        setActiveNodes(new Set()); 
        setShowReport(true);
      }, 800);
      return;
    }
    const t = setTimeout(() => {
      setActiveNodes(prev => new Set([...prev, SIM_SEQUENCE[simStep]]));
      const node = nodes.find(n => n.id === SIM_SEQUENCE[simStep]);
      if (node) setSelectedNode(node);
      setSimStep(s => s + 1);
    }, simStep === -1 ? 0 : 700);
    return () => clearTimeout(t);
  }, [simActive, simStep, nodes]);

  const startSim = () => {
    setActiveNodes(new Set());
    setSimStep(0);
    setSimActive(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({ x: dragStart.current.px + e.clientX - dragStart.current.x, y: dragStart.current.py + e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => { isDragging.current = false; };

  const badgeStyle = (color: string) => {
    if (color === "primary") return "bg-primary/10 text-primary";
    if (color === "secondary") return "bg-secondary/10 text-secondary";
    if (color === "amber") return "bg-amber-50 text-amber-700 border border-amber-100";
    if (color === "red") return "bg-red-50 text-red-700 border border-red-100";
    return "bg-slate-100 text-slate-600";
  };

  const iconColor = (color: string) => {
    if (color === "primary") return "text-primary";
    if (color === "secondary") return "text-secondary";
    if (color === "amber") return "text-amber-500";
    if (color === "red") return "text-red-500";
    return "text-slate-400";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .neon-line {
          stroke-dasharray: 10 4;
          animation: dashMove 20s linear infinite;
        }
        .neon-line-active {
          stroke: hsl(var(--primary));
          opacity: 0.9;
          stroke-width: 2.5;
          stroke-dasharray: none;
          animation: none;
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -500; }
        }
        .node-card {
          transition: all 0.2s ease;
        }
        .node-card:hover {
          transform: scale(1.04);
          z-index: 20;
        }
        .node-active {
          ring: 2px;
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3), 0 4px 12px hsl(var(--primary) / 0.2);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .graph-canvas {
          cursor: grab;
          user-select: none;
        }
        .graph-canvas:active {
          cursor: grabbing;
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        .pulse-ring {
          animation: pulseRing 1.8s ease-in-out infinite;
        }
      ` }} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="page-heading text-foreground">Knowledge Graph</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Explore causal linkages and propagation pathways generated by <span className="citylearn-brand">CityLearn</span>'s neural mapping engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Graph Viewport */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div
              id="graph-container"
              ref={containerRef}
              className="bg-slate-50 border border-border shadow-sm rounded-2xl relative overflow-hidden graph-canvas"
              style={{ height: 560 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
              
              {/* Simulation progress bar */}
              {simActive && (
                <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-slate-200">
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{ width: `${(activeNodes.size / SIM_SEQUENCE.length) * 100}%` }}
                  />
                </div>
              )}

              {/* SVG edges */}
              <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="hsl(var(--primary))" opacity="0.4" />
                  </marker>
                  <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="hsl(var(--primary))" />
                  </marker>
                </defs>
                {edges.map((e, i) => {
                  const isEdgeActive = activeNodes.has(e.fromId) && activeNodes.has(e.toId);
                  return (
                    <path
                      key={i}
                      d={e.d}
                      fill="none"
                      stroke={isEdgeActive ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                      strokeWidth={isEdgeActive ? "2.5" : "1.5"}
                      opacity={isEdgeActive ? 0.9 : 0.35}
                      className={isEdgeActive ? "neon-line-active" : "neon-line"}
                      markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow)"}
                      filter={isEdgeActive ? "url(#glow)" : undefined}
                      style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              <div
                className="relative w-full h-full"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: isDragging.current ? "none" : "transform 0.1s ease", zIndex: 2 }}
              >
                {nodes.map(node => {
                  const isActive = activeNodes.has(node.id);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      data-id={node.id}
                      className="absolute node-card"
                      style={{ top: node.y, left: node.x }}
                      onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                    >
                      {/* Pulse ring for active nodes */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-primary/20 pulse-ring -m-2 pointer-events-none" style={{ zIndex: 0 }} />
                      )}
                      <div
                        className={`relative bg-white border p-3.5 rounded-xl shadow-sm w-44 cursor-pointer transition-all ${
                          isSelected ? "border-primary shadow-md ring-2 ring-primary/20" :
                          isActive ? "border-primary/50 node-active" :
                          "border-border hover:border-primary/40 hover:shadow-md"
                        }`}
                        style={{ zIndex: 1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`material-symbols-outlined text-xl ${iconColor(node.badgeColor)}`}>{node.icon}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${badgeStyle(node.badgeColor)}`}>{node.badge}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">{node.label}</h4>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/50 rounded-full" style={{ width: `${node.impact}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">{node.impact}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sim status overlay */}
              {simActive && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Simulating: {activeNodes.size}/{SIM_SEQUENCE.length} nodes activated
                </div>
              )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 p-2 bg-white/95 backdrop-blur-md border border-border rounded-full shadow-sm">
                <button
                  onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-foreground transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-lg">zoom_in</span>
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-foreground transition-colors"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-lg">zoom_out</span>
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-foreground transition-colors"
                  title="Reset View"
                >
                  <span className="material-symbols-outlined text-lg">filter_center_focus</span>
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <span className="text-[9px] font-mono text-muted-foreground px-2">{Math.round(zoom * 100)}%</span>
                <div className="w-px h-5 bg-border mx-1" />
                <button
                  onClick={startSim}
                  disabled={simActive}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 disabled:opacity-60 text-white font-semibold rounded-full text-xs hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">{simActive ? "hourglass_empty" : "play_arrow"}</span>
                  {simActive ? "Running..." : "Run Simulation"}
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-border shadow-sm rounded-2xl p-6 flex flex-col space-y-5 h-full">
              
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">database</span>
                  Node Metadata
                </h3>
                {selectedNode && (
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Selected: {selectedNode.id.toUpperCase()}</p>
                )}
              </div>

              {selectedNode && (
                <div className="space-y-4 flex-1">
                  
                  {/* Node Identity */}
                  <div className="p-3 bg-slate-50 border border-border rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${iconColor(selectedNode.badgeColor)}`}>{selectedNode.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{selectedNode.label}</p>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${badgeStyle(selectedNode.badgeColor)}`}>{selectedNode.badge}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{selectedNode.desc}</p>
                  </div>

                  {/* Causality Analysis */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Causality Analysis</h4>
                    
                    <div className="p-3 bg-slate-50 border border-border rounded-xl space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground">Impact Probability</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${selectedNode.impact}%` }}></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-primary">{selectedNode.impact}%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-border rounded-xl space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground">Propagation Delay</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: "42%" }}></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-secondary">{selectedNode.delay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interconnected Hubs */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Connected Nodes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {EDGES
                        .filter(([a, b]) => a === selectedNode.id || b === selectedNode.id)
                        .map(([a, b]) => {
                          const otherId = a === selectedNode.id ? b : a;
                          const otherNode = nodes.find(n => n.id === otherId);
                          if (!otherNode) return null;
                          return (
                            <div
                              key={otherId}
                              onClick={() => setSelectedNode(otherNode)}
                              className="bg-slate-50 border border-border p-2.5 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                            >
                              <span className={`material-symbols-outlined mb-1 text-lg ${iconColor(otherNode.badgeColor)}`}>{otherNode.icon}</span>
                              <span className="text-[9px] font-bold text-foreground leading-tight">{otherNode.label}</span>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* Neural Trace */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Neural Trace</h4>
                    <div className="relative pl-4 space-y-3.5 before:content-[''] before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
                      <div className="relative">
                        <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white"></div>
                        <p className="text-xs font-bold text-foreground">Event Ingested</p>
                        <p className="text-[10px] text-muted-foreground">Today at 14:22:01</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-white"></div>
                        <p className="text-xs font-bold text-foreground">Causality Mapping</p>
                        <p className="text-[10px] text-muted-foreground">Today at 14:22:05</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white"></div>
                        <p className="text-xs font-bold text-foreground">Predictive Logic Run</p>
                        <p className="text-[10px] text-muted-foreground">Today at 14:22:12</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showReport && reportData && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReport(false)}
        >
          <div
            className="bg-white border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-6 py-5 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Simulation Complete
                  </span>
                  <h2 className="text-lg font-bold text-foreground">Simulation Report</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {reportData.eventType} at {reportData.location}
                  </p>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors"
                  aria-label="Close report"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mitigated Delay</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    -{reportData.mitigatedDelayDelta ?? Math.round(reportData.resolutionTime * 0.18)}m
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    From {reportData.resolutionTime}m baseline
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Efficiency Gain</p>
                  <p className="text-xl font-bold text-secondary mt-1">+{reportData.efficiencyGains}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Operational throughput</p>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Congestion Delta</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">
                    {reportData.congestionBefore ?? 62} → {reportData.congestionAfter ?? 53}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Severity index reduced</p>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Officers Deployed</p>
                  <p className="text-xl font-bold text-foreground mt-1">{reportData.officerCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Recommended manpower</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">memory</span>
                  <p className="text-xs font-bold text-foreground">Institutional Memory Upload</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Event fingerprint <span className="font-mono font-bold text-primary">EP-{reportData.activeId}</span> committed to vector memory
                  with <span className="font-bold text-foreground">{reportData.similarityScore}%</span> similarity fidelity.
                  All 7 simulation nodes validated and transaction logged.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
              >
                Acknowledge Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
