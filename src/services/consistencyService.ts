import type { LapTime } from "../types/f1";

export interface ConsistencyResult {
  driverId: string;
  driverName: string;
  avg: number;
  stddev: number;
  cv: number;
  score: number;
  laps: number;
}

export function calculateConsistency(laps: LapTime[]): ConsistencyResult[] {
  const byDriver: Record<string, LapTime[]> = {};

  laps.forEach((lap) => {
    if (lap.lap_time !== null) {
      if (!byDriver[lap.driver]) byDriver[lap.driver] = [];
      byDriver[lap.driver].push(lap);
    }
  });

  return Object.values(byDriver).map((driverLaps) => {
    const driver = driverLaps[0];
    const times = driverLaps.map((l) => l.lap_time!);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance =
      times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
    const stddev = Math.sqrt(variance);
    const cv = avg > 0 ? stddev / avg : 0;
    const score = Math.max(0, 100 - cv * 100);

    return {
      driverId: driver.driver,
      driverName: driver.driver_fullname,
      avg,
      stddev,
      cv,
      score,
      laps: times.length,
    };
  });
}
