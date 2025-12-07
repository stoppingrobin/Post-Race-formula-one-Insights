import { Zap, Clock, Gauge, Wrench } from "lucide-react";
import type { DriverPerformance } from "../../services/driverPerformanceService";

function formatTime(sec: number | null) {
  if (!sec || sec <= 0 || sec === Infinity) return "-";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds.toFixed(3)}`;
}

export function DriverPerformanceCard({ data }: { data: DriverPerformance }) {
  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-700 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{data.driverName}</h3>
          <p className="text-sm text-neutral-400">{data.team}</p>
        </div>
        <span className="text-yellow-400 font-bold">#{data.driverId}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-neutral-800 p-2 rounded">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs">Avg Pace</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold">{formatTime(data.avgPace)}</p>
          <p className="text-xs text-neutral-400">
            Best {formatTime(data.fastestLap)}
          </p>
        </div>

        <div className="bg-neutral-800 p-2 rounded">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs">Consistency</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold">{data.consistency.toFixed(1)}</p>
        </div>

        <div className="bg-neutral-800 p-2 rounded">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs">Pit Stops</span>
            <Wrench className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg font-bold">{data.pitStops}</p>
        </div>

        <div className="bg-neutral-800 p-2 rounded">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs">Avg Stop</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-lg font-bold">
            {data.avgPit ? `${data.avgPit.toFixed(2)}s` : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
