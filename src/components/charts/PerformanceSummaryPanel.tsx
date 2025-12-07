import { useTelemetry } from "../../context/TelemetryContext";
import { StatCard } from "../ui/StatCard";
import { Zap, Clock } from "lucide-react";
import {formatTime} from "../../utils/timeUtils.ts";

// Overall fastest lap of the race (between the selected laps)
// Overall average pace of the race (between the selected laps)
// Fastest lap of the selected drivers (if any)
// Average pace of the selected drivers (if any)
export default function PerformanceSummaryPanel() {
  const { lapTimes, filter } = useTelemetry();
  const { season, round, drivers, lapRange } = filter;

  // 👉 Filter laps by race + lap range
  const eventLaps = lapTimes.filter(
    (l) =>
      l.season === season &&
      l.round === round &&
      l.lap_number >= lapRange[0] &&
      l.lap_number <= lapRange[1] &&
      l.lap_time !== null
  );

  if (!eventLaps.length) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg">
        <p className="text-neutral-400">No lap data in this range</p>
      </div>
    );
  }

  // ---- Overall fastest lap ----
  const fastest = eventLaps.reduce((best, lap) =>
    lap.lap_time! < best.lap_time! ? lap : best
  );

  // ---- Overall average pace ----
  const overallAvg =
    eventLaps.reduce((sum, lap) => sum + (lap.lap_time ?? 0), 0) /
    eventLaps.length;

  // ---- Selected drivers stats ----
  let selectedCards: any[] = [];

  if (drivers.length > 0) {
    const selectedLaps = eventLaps.filter((l) =>
      drivers.includes(l.driver)
    );

    if (selectedLaps.length) {
      // Fastest among selected
      const selFastest = selectedLaps.reduce((best, lap) =>
        lap.lap_time! < best.lap_time! ? lap : best
      );

      // Average pace of selected drivers
      const selAvg =
        selectedLaps.reduce((sum, l) => sum + (l.lap_time ?? 0), 0) /
        selectedLaps.length;

      selectedCards = [
        <StatCard
          key="sel-fastest"
          title="Selected Drivers – Fastest Lap"
          value={formatTime(selFastest.lap_time!)}
          subtitle={`${selFastest.driver_fullname} – Lap ${selFastest.lap_number}`}
          icon={<Zap className="w-4 h-4 text-green-400" />}
          iconBg="bg-green-900/40"
        />,
        <StatCard
          key="sel-avg"
          title="Selected Drivers – Average Pace"
          value={formatTime(selAvg)}
          subtitle={`Across ${selectedLaps.length} laps`}
          icon={<Clock className="w-4 h-4 text-purple-400" />}
          iconBg="bg-purple-900/40"
        />,
      ];
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {/* Overall cards */}
      <StatCard
        title={`Fastest Lap (${lapRange[0]}-${lapRange[1]})`}
        value={formatTime(fastest.lap_time!)}
        subtitle={`${fastest.driver_fullname} – Lap ${fastest.lap_number}`}
        icon={<Zap className="w-4 h-4 text-yellow-400" />}
        iconBg="bg-yellow-900/40"
      />

      <StatCard
        title={`Average Pace (${lapRange[0]}-${lapRange[1]})`}
        value={formatTime(overallAvg)}
        subtitle={`Across ${eventLaps.length} laps`}
        icon={<Clock className="w-4 h-4 text-blue-400" />}
        iconBg="bg-blue-900/40"
      />

      {/* Selected drivers summary (if any) */}
      {selectedCards}
    </div>
  );
}
