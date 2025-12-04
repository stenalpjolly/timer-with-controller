export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export interface AgendaSegment {
  title: string;
  durationMinutes: number;
}

export interface TimerConfig {
  totalMinutes: number;
  topic?: string;
  segments?: AgendaSegment[];
}

export type TimerMode = 'SIMPLE' | 'AGENDA';

// Remote Control Types

export type PeerCommandType =
  | 'START'
  | 'PAUSE_TOGGLE'
  | 'RESET'
  | 'ADD_MINUTE'
  | 'SUB_MINUTE'
  | 'SYNC_STATE'
  | 'GET_STATE';

export interface PeerMessage {
  type: PeerCommandType;
  payload?: any;
}

export interface SyncStatePayload {
  secondsRemaining: number;
  totalSeconds: number;
  status: TimerStatus;
  config: TimerConfig | null;
}