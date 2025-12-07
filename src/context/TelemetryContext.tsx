import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { loadLapTimes, loadPitStops } from "../services/dataService";
import type { LapTime, PitStop } from "../types/f1";

interface Filter {
  season: number;
  round: number;
  drivers: string[];
  lapRange: [number, number];   // NEW: [minLap, maxLap]
  showDropOffs: boolean;      // NEW
}

interface TelemetryCtx {
  lapTimes: LapTime[];
  pitStops: PitStop[];
  driverTeamMap: Record<string, string>;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

const TelemetryContext = createContext<TelemetryCtx | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [pitStops, setPitStops] = useState<PitStop[]>([]);
  const [filter, setFilter] = useState<Filter>({ season: 2025, round: 1, drivers: [], lapRange: [1, 70], showDropOffs: false });

  useEffect(() => {
    loadLapTimes().then(setLapTimes);
    loadPitStops().then(setPitStops);
  }, []);

  // 🔑 build driver → team map from lapTimes
  const driverTeamMap = useMemo(() => {
    const map: Record<string, string> = {};
    lapTimes.forEach((lap) => {
      if (lap.driver && lap.team && !map[lap.driver]) {
        map[lap.driver] = lap.team;
      }
    });
    return map;
  }, [lapTimes]);

  return (
    <TelemetryContext.Provider value={{ lapTimes, pitStops, driverTeamMap, filter, setFilter }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
}
