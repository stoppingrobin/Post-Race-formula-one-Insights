import type { LapTime, PitStop } from "../types/f1";
import { calculateConsistency } from "./consistencyService";

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  team: string | null;
  avgPace: number;
  fastestLap: number;
  consistency: number;
  pitStops: number;
  avgPit: number | null;
}

export function calculateDriverPerformance(
  lapTimes: LapTime[],
  pitStops: PitStop[]
): DriverPerformance[] {
  const results: DriverPerformance[] = [];

  // ---- Consistency per driver ----
  const consistency = calculateConsistency(lapTimes);

  // Group laps by driver
  const drivers = [...new Set(lapTimes.map((l) => l.driver))];

  drivers.forEach((drv) => {
    const drvLaps = lapTimes.filter((l) => l.driver === drv);
    if (!drvLaps.length) return;

    const avg =
      drvLaps.reduce((sum, l) => sum + (l.lap_time ?? 0), 0) /
      drvLaps.length;
    const fastest = Math.min(...drvLaps.map((l) => l.lap_time ?? Infinity));
    const cons = consistency.find((c) => c.driverId === drv);

    const drvStops = pitStops.filter((p) => p.driverId === drv);
    const avgPit = drvStops.length
      ? drvStops.reduce((s, p) => s + (p.duration ?? 0), 0) / drvStops.length
      : null;

    results.push({
      driverId: drv,
      driverName: drvLaps[0].driver_fullname,
      team: drvLaps[0].team,
      avgPace: avg,
      fastestLap: fastest,
      consistency: cons?.score ?? 0,
      pitStops: drvStops.length,
      avgPit,
    });
  });

  return results.sort((a, b) => a.avgPace - b.avgPace); // sort by avg pace
}
