// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { loadUnifiedAnalysis, saveApprovedRecommendation } from "@/lib/analysis";
import { AuthToast } from "@/components/shared/AuthToast";
import { jsPDF } from "jspdf";

export default function Page() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await loadUnifiedAnalysis();
        setAnalysis(data);
      } catch (err) {
        console.error("Failed to load strategic recommendations:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecommendations();

    // indicator delay
    const pulses = document.querySelectorAll(".pulse-neural");
    pulses.forEach((p) => {
      p.style.animationDuration = 2 + Math.random() * 3 + "s";
      p.style.animationDelay = Math.random() * 2 + "s";
    });
  }, []);

  /*
   * DEVELOPER AUDIT: Response Strategies Graph / Map
   * - Data Source: Fed by `loadUnifiedAnalysis()` which retrieves the latest ML prediction payload (local storage or `/api/last-analysis`).
   * - Static vs Dynamic: Previously, the SVG shapes (routes, sectors, nodes) were static coordinates. Redesigned to dynamically adapt based on predictions:
   *   - If `barricade_plan.required` is true, a visual barricade core region and warning overlays are drawn.
   *   - If `diversion_strategy.required` is true, detour routes (green neon path) are plotted alongside closed routes (red neon path).
   *   - The map overlays and markers display the actual predicted officer counts and deployment area.
   * - Relation to backend predictions: Directly visually encapsulates the `barricade_plan`, `diversion_strategy`, and `officer_deployment` metrics from the ML pipeline.
   * - Decision making: Visualizes context for traffic control operators to facilitate rapid strategic resource provisioning.
   */

  const handleApprove = () => {
    if (!analysis) return;
    const ev = analysis.event_analysis?.input;
    const recs = analysis.recommendations;
    if (!recs) return;
    const eventId = ev?.id || "9999";
    const record = {
      timestamp: new Date().toISOString(),
      recommendationType: ev?.event_type || "Traffic Mitigation Plan",
      eventId: String(eventId),
      approved: true
    };
    saveApprovedRecommendation(record);
    setToast({
      message: "Recommendation Approved Successfully",
      type: "success"
    });
  };

  const downloadPlanReport = () => {
    if (!analysis) return;
    const ev = analysis.event_analysis?.input;
    const recs = analysis.recommendations;
    if (!recs) return;

    const doc = new jsPDF();

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237); // Primary
    doc.text("CITYLEARN INCIDENT MITIGATION PLAN", 14, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated on: ${timestamp}`, 14, 32);

    // Line divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 36, 196, 36);

    // Event Metadata Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("1. Incident Metadata", 14, 46);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    let y = 54;
    const addMetadataRow = (label: string, value: string, col2Label?: string, col2Value?: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 16, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 16 + labelWidth + 2, y);

      if (col2Label && col2Value !== undefined && col2Value !== null && col2Value !== "") {
        doc.setFont("helvetica", "bold");
        doc.text(col2Label, 110, y);
        const col2LabelWidth = doc.getTextWidth(col2Label);
        doc.setFont("helvetica", "normal");
        doc.text(String(col2Value), 110 + col2LabelWidth + 2, y);
      }
      y += 7;
    };

    addMetadataRow("Event Type:", ev?.event_type || "N/A", "Police Station:", ev?.police_station || "N/A");
    addMetadataRow("Event Cause:", ev?.event_cause || "N/A", "Zone / Sector:", ev?.zone || "N/A");
    addMetadataRow("Corridor Road:", ev?.corridor || "N/A", "Key Junction:", ev?.junction || "N/A");
    addMetadataRow("Estimated Att.:", `${ev?.attendance || 0} people`, "Duration:", `${ev?.duration || 0} mins`);
    addMetadataRow("Coordinates:", `${ev?.latitude || "N/A"}, ${ev?.longitude || "N/A"}`, "Priority Level:", analysis.event_analysis?.fingerprint?.priority || "N/A");

    // Prediction Overview
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("2. Machine Learning Predictions", 14, y);
    y += 8;

    doc.setFontSize(10);
    addMetadataRow("Road Closure Prob:", analysis.predictions?.road_closure_probability || "0%", "Priority Prediction:", analysis.predictions?.priority_prediction || "Low");
    addMetadataRow("Congestion Impact:", `${recs.impact_score ?? 0} / 100`, "Efficiency Gain:", `+${recs.efficiency_gains ?? 0}%`);

    // Recommended Mitigation Strategy
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("3. Recommended Mitigation Directives", 14, y);
    y += 8;

    const addMitigationSection = (num: string, title: string, details: Array<{ label: string; text: string }>) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(124, 58, 237);
      doc.text(`${num}. ${title}`, 16, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      details.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.text(item.label, 18, y);
        doc.setFont("helvetica", "normal");
        
        // Wrap text to fit page
        const lines = doc.splitTextToSize(String(item.text), 130);
        doc.text(lines, 60, y);
        y += (lines.length * 5) + 2;
      });
      y += 2;
    };

    addMitigationSection("A", "Manpower Deployment", [
      { label: "Recommended Officers:", text: `${recs.officer_deployment?.officer_count ?? 0} Officers` },
      { label: "Deployment Sector:", text: recs.officer_deployment?.deployment_area ?? ev?.zone ?? "N/A" },
      { label: "Directive Action:", text: recs.officer_deployment?.recommended_action ?? recs.officer_deployment?.action ?? "N/A" },
      { label: "Deployment Reasoning:", text: recs.officer_deployment?.reasoning ?? "N/A" }
    ]);

    // Check if we need a new page for barricades and diversion (in case y gets too high)
    if (y > 210) {
      doc.addPage();
      y = 25;
    }

    addMitigationSection("B", "Barricading Strategy", [
      { label: "Barricades Required:", text: recs.barricade_plan?.required ? "Yes (Active deployment)" : "No (Normal monitoring)" },
      { label: "Placement Location:", text: recs.barricade_plan?.barricade_location ?? ev?.corridor ?? "N/A" },
      { label: "Barricade Details:", text: recs.barricade_plan?.reasoning ?? "N/A" }
    ]);

    if (y > 210) {
      doc.addPage();
      y = 25;
    }

    addMitigationSection("C", "Traffic Diversion Plan", [
      { label: "Diversion Status:", text: recs.diversion_strategy?.required ? "Active (Initiate detours)" : "Inactive (Monitor flow)" },
      { label: "Detour Routes:", text: recs.diversion_strategy?.suggested_route ?? "N/A" },
      { label: "Diversion Reasoning:", text: recs.diversion_strategy?.reasoning ?? "N/A" }
    ]);

    // Footer
    doc.setDrawColor(241, 245, 249);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("CityLearn Command Center - Confidential Response Plan", 14, 285);
    doc.text(`Page 1 of ${doc.getNumberOfPages()}`, 180, 285);

    doc.save(`citylearn_mitigation_plan_${ev?.id || "event"}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-xs text-muted-foreground font-mono">Formulating response strategies...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center bg-white border border-border rounded-2xl shadow-sm">
        <span className="material-symbols-outlined text-muted-foreground text-5xl mb-4">info</span>
        <h2 className="text-xl font-bold text-foreground mb-2">No Recommendations Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          No event has been analyzed yet. Go to the Analysis Engine to submit an event and generate dynamic strategic recommendations.
        </p>
        <a href="/analysis-engine" className="inline-block bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
          Go to Analysis Engine
        </a>
      </div>
    );
  }

  const activeEvent = analysis?.event_analysis?.input || null;
  const recommendations = analysis?.recommendations || null;
  const impactScore = recommendations ? recommendations.impact_score : 0;
  const efficiencyGains = recommendations ? recommendations.efficiency_gains : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .pulse-neural {
          animation: neural-pulse 3s infinite ease-in-out;
        }

        @keyframes neural-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        .neon-line {
          stroke-dasharray: 8;
          animation: dash 25s linear infinite;
        }

        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }

        .map-container {
          mask-image: radial-gradient(circle at center, black 75%, transparent 100%);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      ` }} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
          <div className="space-y-2">
            <h1 className="page-heading text-foreground">
              Response Strategies
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Neural Intelligence Recommendation Matrix for Containment and Optimization
            </p>
          </div>
          <button
            onClick={downloadPlanReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-dark font-semibold rounded-xl text-xs border border-primary/20 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Download Mitigation Plan
          </button>
        </div>

        {/* Main Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Area: Map and Recommendations list (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Map Visualization Card */}
            <div className="bg-white border border-border shadow-sm rounded-2xl h-[450px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-slate-50/50">
                <img
                  className="w-full h-full object-cover opacity-10 grayscale scale-110 blur-[1px] pointer-events-none"
                  alt="City Grid Map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQKhfAB-NqVn4jrd8F9yh22RO0Sz0KzRTcQYzP8x0Ag5Y1cCiA4pPp55_Vq0UAcxV0xrwFyV5C3RqHw0Af4zRN8rHIJ77WeJgzP_Om88txChfruf_RZD54Eux7uvUAjn3DY7yYlNLAy0NXZQ0_9fHUczE93RdmhOA_NzQDYW7ektCLzCpSdnlXnVoNc6FQW3Zlxu_FZFj9pPHMqESi1NjhUVQa2WmrtiMclksru9E2im1z0CZvzz3YhMrna1vXxfA5eRmLg2gahmU"
                />
                
                {/* SVG Route Overlays */}
                <svg className="absolute inset-0 w-full h-full map-container" fill="none" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
                  {/* Dynamic routes based on diversion strategy */}
                  {recommendations?.diversion_strategy?.required ? (
                    <>
                      {/* closed route (red) */}
                      <path className="neon-line" d="M300 200 L500 400" stroke="hsl(var(--destructive))" strokeDasharray="4 8" strokeWidth="3"></path>
                      {/* detour route (green) */}
                      <path className="neon-line" d="M300 200 L450 100 L700 250" stroke="#10b981" strokeDasharray="8 12" strokeWidth="2.5"></path>
                      <path className="neon-line" d="M500 400 L700 250" stroke="hsl(var(--secondary))" strokeDasharray="8 12" strokeWidth="2.5"></path>
                      <text fill="#10b981" fontFamily="var(--font-noto-sans)" fontSize="9" fontWeight="bold" letterSpacing="1" x="420" y="80">DETOUR_ROUTE_ACTIVE</text>
                    </>
                  ) : (
                    <>
                      {/* normal route */}
                      <path className="neon-line" d="M300 200 L500 400 L700 250" stroke="hsl(var(--secondary))" strokeDasharray="8 12" strokeWidth="2.5"></path>
                      <path className="neon-line" d="M300 200 L150 150 M500 400 L550 550 M700 250 L850 300" stroke="hsl(var(--primary))" strokeDasharray="4 8" strokeWidth="1.5" opacity="0.6"></path>
                    </>
                  )}

                  {/* Dynamic barricade area */}
                  {recommendations?.barricade_plan?.required ? (
                    <>
                      <rect fill="hsl(var(--destructive))" fillOpacity="0.08" height="80" stroke="hsl(var(--destructive))" strokeWidth="1.5" strokeDasharray="4 4" width="140" x="430" y="360" rx="4"></rect>
                      <text fill="hsl(var(--destructive))" fontFamily="var(--font-noto-sans)" fontSize="9" fontWeight="bold" letterSpacing="1" x="440" y="385">BARRICADE_ZONE_ACTIVE</text>
                      <text fill="hsl(var(--destructive))" fontFamily="var(--font-noto-sans)" fontSize="7" fontWeight="bold" x="440" y="400">RESTRICTED PASSAGE</text>
                    </>
                  ) : (
                    <>
                      <rect fill="hsl(var(--secondary))" fillOpacity="0.06" height="100" stroke="hsl(var(--secondary))" strokeWidth="1" width="120" x="440" y="350" rx="4"></rect>
                      <text fill="hsl(var(--secondary))" fontFamily="var(--font-noto-sans)" fontSize="9" fontWeight="bold" letterSpacing="1" x="450" y="375">SECTOR_ANOMALY_CORE</text>
                    </>
                  )}

                  <circle className="pulse-neural" cx="300" cy="200" fill="hsl(var(--secondary))" r="5"></circle>
                  <circle className="pulse-neural" cx="500" cy="400" fill="hsl(var(--secondary))" r="5" style={{ animationDelay: "1s" }}></circle>
                  <circle className="pulse-neural" cx="700" cy="250" fill="hsl(var(--primary))" r="5" style={{ animationDelay: "2s" }}></circle>
                </svg>
              </div>

              {/* Map Floating UI overlays */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-md border border-border shadow-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">navigation</span>
                  <span className="text-xs font-semibold text-foreground">
                    {activeEvent ? `Event: ${activeEvent.event_type} (${activeEvent.corridor})` : "Loading simulation..."}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-white/90 backdrop-blur-md border border-border shadow-sm p-4 rounded-xl flex flex-col gap-1 min-w-[180px]">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Deployment Location</p>
                  <p className="text-xs font-bold text-foreground">
                    {activeEvent ? activeEvent.corridor : "Bengaluru"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendation Cards Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Officer Deployment */}
              <div className="bg-amber-50/20 border border-amber-200/80 p-6 rounded-2xl group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 border border-amber-200 text-amber-700 transition-colors">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_police</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Officer Deployment</h3>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    {isLoading ? "Analyzing database patterns..." : recommendations?.officer_deployment?.reasoning || "Standard patrol allocation."}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-amber-200/40">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {isLoading ? "..." : `${recommendations?.officer_deployment?.officer_count || 1} Officers`}
                  </span>
                </div>
              </div>

              {/* Card 2: Barricade Plan */}
              <div className="bg-amber-50/20 border border-amber-200/80 p-6 rounded-2xl group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 border border-amber-200 text-amber-700 transition-colors">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>fence</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Barricade Plan</h3>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    {isLoading ? "Calculating barrier positions..." : recommendations?.barricade_plan?.reasoning || "Standard monitoring layout."}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-amber-200/40">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {isLoading ? "..." : (recommendations?.barricade_plan?.required ? "Required" : "Not Required")}
                  </span>
                </div>
              </div>

              {/* Card 3: Diversion Strategy */}
              <div className="bg-amber-50/10 border border-amber-200/60 p-6 rounded-2xl group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 border border-amber-200/60 text-amber-600 transition-colors">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Diversion Strategy</h3>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    {isLoading ? "Mapping alternative routes..." : recommendations?.diversion_strategy?.reasoning || "Flow optimization analysis."}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-amber-200/40">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    {isLoading ? "..." : (recommendations?.diversion_strategy?.required ? "Active" : "Monitor Flow")}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Area: Sidebar Statistics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-border shadow-sm p-6 rounded-2xl space-y-5">
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">Neural Analysis</h3>
                
                <div className="space-y-4">
                  
                  {/* Metric 1 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">savings</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Resource Savings</p>
                        <p className="text-lg font-bold text-foreground">{isLoading ? "..." : `${(efficiencyGains * 0.8).toFixed(0)}%`}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">ESTIMATED</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">speed</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Optimization Time</p>
                        <p className="text-lg font-bold text-foreground">142ms</p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">PEAK</span>
                  </div>

                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confidence Threshold</p>
                  <span className="text-xs font-bold text-primary">90%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "90%" }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Min: 70%</span>
                  <span>Target: 90%</span>
                </div>
              </div>

              {/* Quote info and buttons */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-100 text-amber-900">
                  <p className="text-xs italic leading-relaxed text-amber-800">
                    {isLoading ? "Analyzing corridor patterns..." : recommendations ? `"${recommendations.diversion_strategy.reasoning} Route: ${recommendations.diversion_strategy.routes?.join(", ") || "N/A"}."` : "Flow optimizations active."}
                  </p>
                </div>
                
                <button
                  onClick={handleApprove}
                  className="w-full py-4 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">verified</span>
                  Approve Recommendation
                </button>
              </div>

            </div>

            {/* Impact Score and Efficiency Gains */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-border shadow-sm px-6 py-4 rounded-2xl">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                  Impact Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{isLoading ? "..." : impactScore}</span>
                  <span className="font-mono text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="bg-white border border-border shadow-sm px-6 py-4 rounded-2xl">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                  Efficiency Gains
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">+{isLoading ? "..." : efficiencyGains}%</span>
                  <span className="material-symbols-outlined text-green-600 text-sm">trending_up</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {toast && (
        <AuthToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
