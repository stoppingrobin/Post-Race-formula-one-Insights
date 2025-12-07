import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTelemetry } from "../../context/TelemetryContext";
import { calculateLostTimes } from "../../services/lostTimeService";
import { getDriverColor } from "../../utils/colors";

function shortLabel(driver: string, lap: number) {
  const parts = driver.split(" ");
  const last = parts[parts.length - 1] || driver;
  const abbr = last.substring(0, 3).toUpperCase();
  return `${abbr} L${lap}`;
}

export default function LostTimeChart() {
  const { lapTimes, pitStops, filter, driverTeamMap } = useTelemetry();
  const { season, round, drivers } = filter;

  // 👉 Filter laps & stops for current event
  const eventLapTimes = lapTimes.filter(
    (l) => l.season === season && l.round === round
  );
  const eventPitStops = pitStops.filter(
    (p) => p.season === season && p.round === round
  );

  // 👉 Calculate lost times
  let lostTimes = calculateLostTimes(eventLapTimes, eventPitStops).filter(
    (lt) =>
      lt.lostTime !== null &&
      lt.lostTime > 0 &&
      (drivers.length === 0 || drivers.includes(lt.driverId))
  );

  // 👉 If no drivers selected → restrict to race result top 3
  if (drivers.length === 0) {
    const raceOrder: string[] = [];
    for (const lap of eventLapTimes) {
      if (!raceOrder.includes(lap.driver)) {
        raceOrder.push(lap.driver);
      }
    }
    const top3 = raceOrder.slice(0, 3);
    lostTimes = lostTimes.filter((lt) => top3.includes(lt.driverId));
  }

  // 👉 Sort by lap number for chronological order
  lostTimes.sort((a, b) => a.lap - b.lap);

  const data = lostTimes.map((lt) => ({
    key: shortLabel(lt.driverName, lt.lap),
    driverId: lt.driverId,
    driver: lt.driverName,
    lap: lt.lap,
    duration: lt.duration ?? 0,
    lostTime: lt.lostTime ?? 0,
    outLap: lt.outLap,
    baseline: lt.baseline,
    outLapDelta: lt.outLapDelta,
    team: lt.team,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const stop = payload[0].payload;

      return (
        <div className="bg-neutral-800 p-3 rounded shadow text-sm text-white">
          <p className="font-semibold">{stop.driver} (Lap {stop.lap})</p>
          <p>Pit Duration: {stop.duration.toFixed(2)}s</p>
          {stop.outLap && (
            <>
              <p>Out-Lap: {stop.outLap.toFixed(2)}s</p>
              <p>Baseline Pace: {stop.baseline.toFixed(2)}s</p>
              <p>Out-Lap Delta: +{stop.outLapDelta.toFixed(2)}s</p>
            </>
          )}
          <p className="font-bold text-red-400">
            Total Lost Time: {stop.lostTime.toFixed(2)}s
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg">
        <p className="text-neutral-400">No lost time data available</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Lost Time Analysis</h2>
        <p className="text-sm text-neutral-400">
          Pit stop duration + out-lap delta vs baseline
        </p>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="key"
              stroke="#aaa"
              interval={0}     // show all labels
              angle={-45}
              textAnchor="end"
              height={10}
            />
            <YAxis stroke="#aaa" unit="s" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="duration" stackId="a" fill="#666" name="Pit Duration" />
            <Bar dataKey="outLapDelta" stackId="a" name="Out-Lap Delta">
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={getDriverColor(d.driverId, driverTeamMap[d.driverId])}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
