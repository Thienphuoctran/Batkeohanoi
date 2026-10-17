// Định nghĩa dữ liệu trung tâm cho App Bóng Đá (Football App)

export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";

export type PitchType = "5_A_SIDE" | "7_A_SIDE" | "11_A_SIDE" | "FUTSAL";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";
  playerName: string;
  teamId: string;
  detail?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  currentMinute?: number;
  status: MatchStatus;
  startTime: string;
  stadiumName: string;
  events?: MatchEvent[];
}

export interface PitchSlot {
  id: string;
  startTime: string;
  endTime: string;
  priceVnd: number;
  isBooked: boolean;
  bookedBy?: string;
}

export interface PitchComplex {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  pitchType: PitchType;
  pricePerHour: number;
  rating: number;
  totalReviews: number;
  imageUrl: string;
  amenities: string[];
  slots: PitchSlot[];
}

export interface PlayerTacticsPosition {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  coordX: number; // Tọa độ % trên sân (0 - 100)
  coordY: number; // Tọa độ % trên sân (0 - 100)
}

export interface TacticBoard {
  id: string;
  teamName: string;
  formation: "4-3-3" | "4-2-3-1" | "3-5-2" | "5-3-2" | "3-2-1" | "2-3-1";
  players: PlayerTacticsPosition[];
}
