import { TourneySettings, TourneySpecification } from "~/types/tourney";

export type Round = {
  id: string;
  nextRoundId?: string;
  gameId: string;
  settings: TourneySettings;
  specification: TourneySpecification;
  participants: RoundParticipant[];
  artifacts: unknown[];
  history: unknown[];
  winnerId?: string;
  currentState?: {
    state?: RoundState;
  };
  order: number;
};

export type CreateRound = {
  gameId: string;
  nextRoundId?: string | null;
  participants: RoundParticipant[];
  specification: TourneySpecification;
  order: number;
};

export enum RoundState {
  None = "none",
  Prepare = "prepare",
  Presentation = "presentation",
  Defense = "defense",
  Mark = "mark",
  Complete = "complete",
  Pause = "pause",
}

export type RoundParticipant = {
  teamId: string;
  challenges: string[];
  isWinner: boolean;
  points: number;
  order: number;
};
