export interface Lap {
  season: number;
  round: number;
  event: string;
  driver: string;             // short code (VER)
  driver_fullname: string;    // full name
}

export interface LapTime extends Lap{
  driver_number: number;
  team: string;
  lap_number: number;
  lap_time: number | null;    // in seconds
  sector1: number | null;
  sector2: number | null;
  sector3: number | null;
  compound: string | null;
  isPersonalBest: boolean;
  timestamp: number | null;
}

export interface PitStop {
  season: number;
  round: number;
  event: string;
  lapNumber: number;
  driverId: string;
  driverName: string;
  team: string;
  duration: number | null;    // in seconds
  compound: string | null;
  timestamp: number | null;
}

export interface LostTime {
  driverId: string;
  driverName: string;
  lap: number;
  duration: number;
  outLap: number | null;
  baseline: number;
  outLapDelta: number | null;  // NEW
  lostTime: number | null;
  compound: string | null;
  team: string | null;
}