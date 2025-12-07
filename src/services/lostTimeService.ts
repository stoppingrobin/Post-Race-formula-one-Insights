import type { LapTime, PitStop, LostTime } from "../types/f1";

export function calculateLostTimes(lapTimes: LapTime[], pitStops: PitStop[]): LostTime[] {
  const results: LostTime[] = [];

  for (const stop of pitStops) {
    // Get laps for this driver in this race
    const driverLaps = lapTimes.filter(
      (l) =>
        l.season === stop.season &&
        l.round === stop.round &&
        l.driver === stop.driverId &&
        l.lap_time !== null
    );

    
    if (!driverLaps.length) continue;

    // Out lap (first lap after the stop)
    const outLap = driverLaps.find((l) => l.lap_number === stop.lapNumber + 1);

    // Baseline = median of all race laps excluding in/out laps
    const validRaceLaps = driverLaps.filter(
      (l) =>
        l.lap_number !== stop.lapNumber && // exclude in-lap
        l.lap_number !== stop.lapNumber + 1 // exclude out-lap
    );
    const sorted = validRaceLaps.map((l) => l.lap_time!).sort((a, b) => a - b);
    const baseline = sorted.length
      ? sorted[Math.floor(sorted.length / 2)] // median
      : null;

    let lostTime: number | null = null;

    if (stop.duration !== null && outLap && baseline !== null) {
      // lostTime = stop.duration + (outLap.lap_time! - baseline);
      const delta = outLap.lap_time! - baseline;
      lostTime = stop.duration + delta;
      results.push({
        driverId: stop.driverId,
        driverName: stop.driverName,
        lap: stop.lapNumber,
        duration: stop.duration ?? 0,
        outLap: outLap?.lap_time ?? null,
        baseline: baseline ?? 0,
        outLapDelta: delta,          // ✅ include out-lap delta
        lostTime,
        compound: stop.compound,
        team: stop.team,
      });
    } else {
      // still push a result, but with null deltas
      results.push({
        driverId: stop.driverId,
        driverName: stop.driverName,
        lap: stop.lapNumber,
        duration: stop.duration ?? 0,
        outLap: null,
        baseline: 0,
        outLapDelta: null,
        lostTime: null,
        compound: stop.compound,
        team: stop.team,
      });
    }


  }

  return results;
}