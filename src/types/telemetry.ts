export interface TelemetryEvent {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
  sessionId?: string;
  [extra: string]: unknown;
}