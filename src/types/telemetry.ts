//home (termux)/arclune_lane_7x3/src/types/telemetry.ts
export interface TelemetryEvent {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
  sessionId?: string;
  [extra: string]: unknown;
}