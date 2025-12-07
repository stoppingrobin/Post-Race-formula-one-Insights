import type {Lap, LapTime} from "../types/f1.ts";

export const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return "-";

    const totalSeconds = Math.round(sec * 1000) / 1000; // avoid float glitches
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}


export const getFastestLap = (laps: (LapTime & { lap_time: number })[]) =>
    laps.reduce((best, lap) =>
        lap.lap_time < best.lap_time ? lap : best
    );

export const getAverageLapTime = (laps: (Lap & { lap_time: number })[]) =>
    laps.reduce((sum, lap) => sum + lap.lap_time, 0) / laps.length;

