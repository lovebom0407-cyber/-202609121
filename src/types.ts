export type ParticipantStatus = '대기' | '경기대기' | '경기중' | '완주' | '실격' | '기권';

export interface Participant {
  id: string;
  no: string;
  name: string;
  carName?: string;
  time: string; // e.g. "12.345" or ""
  status: ParticipantStatus;
}

export type LaneNumber = 1 | 2 | 3;

export type LaneAssignments = {
  1: string | null;
  2: string | null;
  3: string | null;
};
