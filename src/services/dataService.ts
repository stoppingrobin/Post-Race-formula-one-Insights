import type { LapTime, PitStop } from "../types/f1";

export async function loadLapTimes(): Promise<LapTime[]> {
  const res = await fetch("/data/2024_2025_lap_times.json");
  return res.json();
}

export async function loadPitStops(): Promise<PitStop[]> {
  const res = await fetch("/data/2024_2025_pitstops.json");
  return res.json();
}

export function getSeasons(laps: LapTime[]): number[] {
  return Array.from(new Set(laps.map(l => l.season))).sort();
}

export function getRounds(laps: LapTime[], season: number): { round: number; event: string }[] {
  const filtered = laps.filter(l => l.season === season);
  const unique = new Map<number, string>();
  filtered.forEach(l => unique.set(l.round, l.event));
  return Array.from(unique.entries())
    .map(([round, event]) => ({ round, event }))
    .sort((a, b) => a.round - b.round);
}

export function getDrivers(laps: LapTime[], season: number, round: number): { id: string; name: string; team: string }[] {
  const filtered = laps.filter(l => l.season === season && l.round === round);
  const unique = new Map<string, { id: string; name: string; team: string }>();
  filtered.forEach(l =>
    unique.set(l.driver, { id: l.driver, name: l.driver_fullname, team: l.team })
  );
  return Array.from(unique.values());
}
