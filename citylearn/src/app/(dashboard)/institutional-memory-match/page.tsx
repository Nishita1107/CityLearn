// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { loadUnifiedAnalysis } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export default function Page() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadUnifiedAnalysis();
        setAnalysis(data);
        if (data?.similar_events?.length > 0) {
          setSelectedEvent(data.similar_events[0]);
        }
      } catch (err) {
        console.error("Failed to load unified analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const similarEvents = analysis?.similar_events || [];
  const lessonsLearned = analysis?.lessons_learned || "";
  const masterMatchScore = similarEvents[0]?.similarity_score;

  // Radar metrics derived dynamically from the selected historical event features
  const val_density = selectedEvent 
    ? (selectedEvent.requires_road_closure === "Yes" ? 0.85 : 0.45) 
    : 0.5;
  const val_speed = selectedEvent 
    ? Math.max(0.15, 1 - (selectedEvent.resolution_time || 120) / 480) 
    : 0.5;
  const val_risk = selectedEvent 
    ? (selectedEvent.priority === "High" ? 0.8 : 0.35) 
    : 0.5;
  const val_duration = selectedEvent 
    ? Math.min(1.0, (selectedEvent.resolution_time || 120) / 480) 
    : 0.5;



  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-heading text-foreground">Historical Match Engine</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Dataset similarity results from the most recent Analysis Engine run.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Master Match</span>
          <span className="text-primary font-display font-bold text-3xl">
            {isLoading ? "..." : masterMatchScore !== undefined ? `${masterMatchScore.toFixed(1)}%` : "Run analysis"}
          </span>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dataset Matches</span>
          <span className="text-accent font-display font-bold text-3xl">{isLoading ? "..." : similarEvents.length}</span>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Event</span>
          <span className="text-foreground font-display font-bold text-xl">
            {isLoading ? "..." : analysis?.event_analysis?.event_type || "Run analysis"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Match Details & Metrics */}
        <div className="lg:col-span-5 bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span> Match Details & Metrics
            </h3>

            {/* Selected Event Details Panel */}
            <div className="w-full mb-6 px-4 py-3 bg-slate-50 border border-border rounded-lg text-xs space-y-1">
              <span className="font-semibold text-muted-foreground block text-[9px] uppercase tracking-wider">Currently Selected Case</span>
              <span className="font-bold text-foreground block truncate text-sm">{selectedEvent ? selectedEvent.event_name : "No match selected"}</span>
              <span className="text-[11px] text-muted-foreground block">{selectedEvent ? selectedEvent.location : ""}</span>
            </div>

            {/* Visual Bars for Key Attributes */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Traffic Density Impact</span>
                  <span className="text-foreground font-bold">{selectedEvent ? `${Math.round(val_density * 100)}%` : "—"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: selectedEvent ? `${val_density * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Response Speed (Efficiency)</span>
                  <span className="text-foreground font-bold">{selectedEvent ? `${Math.round(val_speed * 100)}%` : "—"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full transition-all duration-500" 
                    style={{ width: selectedEvent ? `${val_speed * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Congestion Risk Severity</span>
                  <span className="text-foreground font-bold">{selectedEvent ? `${Math.round(val_risk * 100)}%` : "—"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: selectedEvent ? `${val_risk * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Incident Duration Index</span>
                  <span className="text-foreground font-bold">{selectedEvent ? `${Math.round(val_duration * 100)}%` : "—"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: selectedEvent ? `${val_duration * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center">
            <div className="bg-slate-50 border border-border rounded p-3">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Similarity Score</span>
              <span className="text-primary font-bold text-lg">
                {isLoading ? "..." : selectedEvent ? `${selectedEvent.similarity_score.toFixed(1)}%` : "N/A"}
              </span>
            </div>
            <div className="bg-slate-50 border border-border rounded p-3">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pattern Drift</span>
              <span className="text-green-600 font-bold text-lg">
                ±{isLoading ? "..." : selectedEvent ? `${((100 - selectedEvent.similarity_score) * 0.15).toFixed(1)}%` : "0.0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Lessons Learned */}
        <div className="lg:col-span-7 bg-white border border-border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary">psychology</span> Lessons Learned
            </h3>
            {isLoading ? (
              <div className="text-xs text-muted-foreground font-mono">Synthesizing insights...</div>
            ) : lessonsLearned ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{lessonsLearned}</p>
            ) : (
              <div className="text-xs text-muted-foreground font-mono">Run an event analysis to compute lessons learned.</div>
            )}
          </div>
          {analysis && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider mb-1">Recommendation Basis</span>
              <p className="text-xs text-muted-foreground">
                These lessons are dynamically generated from previous matches on <strong>{analysis.event_analysis.location}</strong> with similar crowd size.
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span> Top Historical Matches
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-xs text-muted-foreground font-mono">Loading matching historical logs...</div>
          ) : similarEvents.length > 0 ? (
            similarEvents.map((event, index) => (
              <article 
                key={`${event.id}-${index}`} 
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "bg-white border rounded-xl overflow-hidden flex flex-col shadow-sm cursor-pointer hover:border-primary/45 hover:shadow-md transition-all duration-200",
                  selectedEvent?.id === event.id ? "border-primary ring-2 ring-primary/10 scale-[1.01]" : "border-border"
                )}
              >
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-primary/70 bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit uppercase mb-1">
                        Match #{index + 1}
                      </span>
                      <h4 className="font-display font-bold text-sm leading-tight text-foreground">{event.event_name}</h4>
                    </div>
                    <span className="font-mono text-primary font-bold text-sm bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                      {event.similarity_score.toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground font-semibold">Location</span>
                      <span className="text-foreground font-bold text-right truncate max-w-[160px]">{event.location}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground font-semibold">Timestamp</span>
                      <span className="text-foreground font-bold text-right">{event.timestamp || "Not recorded"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground font-semibold">Priority</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        event.priority === "High" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>{event.priority}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground font-semibold">Closure Required</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        event.requires_road_closure === "Yes" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                      }`}>{event.requires_road_closure}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-xs text-muted-foreground font-mono">Run an event analysis to retrieve historical matches.</div>
          )}
        </div>
      </section>
    </div>
  );
}
