import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTelemetry } from "../../context/TelemetryContext";
import { getDriverColor } from "../../utils/colors";

export default function PitStopPerformance() {
  const { driverTeamMap } = useTelemetry();
  const { pitStops, filter } = useTelemetry();
  const { season, round, drivers } = filter;

  const filtered = pitStops.filter(
    (p) =>
      p.season === season &&
      p.round === round &&
      (drivers.length === 0 || drivers.includes(p.driverId))
  );

  const data = filtered.map((p) => ({
    key: `${p.driverName} L${p.lapNumber}`,
    driverId: p.driverId,
    driver: p.driverName,
    lap: p.lapNumber,
    duration: p.duration || 0,
    compound: p.compound,
    team: p.team,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const stop = payload[0].payload;
      return (
        <div className="bg-neutral-800 p-3 rounded shadow text-sm text-white">
          <p className="font-semibold">{stop.driver}</p>
          <p>Lap {stop.lap}</p>
          <p>Duration: {stop.duration.toFixed(2)}s</p>
          <p>Compound: {stop.compound || "unknown"}</p>
          <p>Team: {stop.team || "unknown"}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pit Stop Performance</h2>
        <p className="text-sm text-neutral-400">
          Duration and timing of pit stops
        </p>
      </div>

      {/* Bar Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="key"
              angle={-45}
              textAnchor="end"
              interval={0}
              stroke="#aaa"
            />
            <YAxis stroke="#aaa" unit="s" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={getDriverColor(entry.driverId, driverTeamMap[entry.driverId])}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend pills */}
      <div className="flex flex-wrap gap-2">
        {data.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-full text-sm"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getDriverColor(p.driverId, driverTeamMap[p.driverId]) }}
            ></span>
            {p.driver} • {p.duration.toFixed(2)}s
          </div>
        ))}
      </div>
    </div>
  );
}
