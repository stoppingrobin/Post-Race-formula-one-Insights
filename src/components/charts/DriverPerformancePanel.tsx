import { useTelemetry } from "../../context/TelemetryContext";
import { calculateDriverPerformance } from "../../services/driverPerformanceService";
import { DriverPerformanceCard } from "../ui/DriverPerformanceCard";

export default function DriverPerformancePanel() {
  const { lapTimes, pitStops, filter } = useTelemetry();
  const { season, round, drivers, lapRange } = filter;

  // Filter laps + stops for current event
  const eventLaps = lapTimes.filter(
    (l) =>
      l.season === season &&
      l.round === round &&
      l.lap_number >= lapRange[0] &&
      l.lap_number <= lapRange[1] &&
      l.lap_time !== null
  );

  const eventStops = pitStops.filter(
    (p) => p.season === season && p.round === round
  );

  const perf = calculateDriverPerformance(eventLaps, eventStops);

  // Show top 3 if no drivers selected
  const shown =
    drivers.length > 0
      ? perf.filter((p) => drivers.includes(p.driverId))
      : perf.slice(0, 3);

  if (!shown.length) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg">
        <p className="text-neutral-400">No driver performance data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shown.map((d) => (
        <DriverPerformanceCard key={d.driverId} data={d} />
      ))}
    </div>
  );
}
