export const ANALYSIS_STORAGE_KEY = "citylearn:last_analysis_response";

export type UnifiedAnalysisResponse = {
  event_analysis: Record<string, any>;
  predictions: Record<string, any>;
  similar_events: Array<Record<string, any>>;
  lessons_learned: string;
  recommendations: {
    officer_deployment: Record<string, any>;
    barricade_plan: Record<string, any>;
    diversion_strategy: Record<string, any>;
    impact_score?: number;
    efficiency_gains?: number;
  };
  dashboard_metrics: Record<string, any>;
};

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export function readStoredAnalysis(): UnifiedAnalysisResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse stored analysis response", error);
    return null;
  }
}

export function storeAnalysis(response: UnifiedAnalysisResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(response));
}

export async function fetchLastAnalysis(): Promise<UnifiedAnalysisResponse | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/last-analysis`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Last analysis API failed");
  return response.json();
}

export async function loadUnifiedAnalysis(): Promise<UnifiedAnalysisResponse | null> {
  const stored = readStoredAnalysis();
  if (stored) return stored;
  const remote = await fetchLastAnalysis();
  if (remote) storeAnalysis(remote);
  return remote;
}

export interface ApprovedRecommendation {
  timestamp: string;
  recommendationType: string;
  eventId: string;
  approved: boolean;
}

export const APPROVED_REC_STORAGE_KEY = "citylearn:approved_recommendations";

export function getApprovedRecommendations(): ApprovedRecommendation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(APPROVED_REC_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse approved recommendations", error);
    return [];
  }
}

export function saveApprovedRecommendation(record: ApprovedRecommendation) {
  if (typeof window === "undefined") return;
  const current = getApprovedRecommendations();
  const exists = current.some(
    (r) => r.eventId === record.eventId && r.recommendationType === record.recommendationType
  );
  if (!exists) {
    current.push(record);
    window.localStorage.setItem(APPROVED_REC_STORAGE_KEY, JSON.stringify(current));
  }
}

export async function fetchBackendMetrics(): Promise<any> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/metrics`);
    if (!response.ok) throw new Error("Metrics API failed");
    return response.json();
  } catch (error) {
    console.error("Failed to fetch backend metrics:", error);
    return null;
  }
}

export async function fetchDashboardMetrics(): Promise<any> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/dashboard-metrics`);
    if (!response.ok) throw new Error("Dashboard metrics API failed");
    return response.json();
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return null;
  }
}


