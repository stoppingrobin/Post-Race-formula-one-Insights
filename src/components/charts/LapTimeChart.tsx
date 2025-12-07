import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTelemetry } from "../../context/TelemetryContext";
import { getDriverColor, getTextColor } from "../../utils/colors";
import { useState } from "react";

const CustomLegend = ({ drivers, hiddenDrivers, toggleDriver, driverTeamMap }: any) => (
  <div className="flex flex-wrap gap-2 justify-center mt-2">
    {drivers.map((driver: string) => {
      const color = getDriverColor(driver, driverTeamMap[driver]);
      console.log("Driver:", driver, "team:", driverTeamMap[driver], "Color:", color);
      const isHidden = hiddenDrivers.includes(driver);
      return (
        <span
          key={driver}
          onClick={() => toggleDriver(driver)}
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            isHidden ? "opacity-40 line-through" : ""
          }`}
          style={{
            backgroundColor: color,
            color: getTextColor(color),
          }}
        >
          {driver}
        </span>
      );
    })}
  </div>
);

export default function LapTimeChart() {
  const { lapTimes, filter, driverTeamMap } = useTelemetry();
  const { season, round, drivers, lapRange } = filter;
  const [hiddenDrivers, setHiddenDrivers] = useState<string[]>([]);

  const toggleDriver = (driver: string) => {
    setHiddenDrivers((prev) =>
      prev.includes(driver)
        ? prev.filter((d) => d !== driver)
        : [...prev, driver]
    );
  };

  // Filter laps
  let filtered = lapTimes.filter(
    (l) =>
      l.season === season &&
      l.round === round &&
      l.lap_number >= lapRange[0] &&
      l.lap_number <= lapRange[1]
  );

  if (drivers.length === 0) {
    const raceOrder: string[] = [];
    for (const lap of filtered) {
      if (!raceOrder.includes(lap.driver)) {
        raceOrder.push(lap.driver);
      }
    }
    const top3 = raceOrder.slice(0, 3);
    filtered = filtered.filter((l) => top3.includes(l.driver));
  } else {
    filtered = filtered.filter((l) => drivers.includes(l.driver));
  }

  // Merge into lap-based data
  const merged: Record<number, any> = {};
  filtered.forEach((lap) => {
    if (!merged[lap.lap_number]) merged[lap.lap_number] = { lap: lap.lap_number };
    merged[lap.lap_number][lap.driver] = lap.lap_time;
  });

  const data = Object.values(merged).sort((a: any, b: any) => a.lap - b.lap);
  const shownDrivers = drivers.length
    ? drivers
    : Array.from(new Set(filtered.map((l) => l.driver)));

  if (data.length === 0) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg shadow-lg">
        <p className="text-neutral-400">No lap time data available</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Lap Time Comparison</h2>
      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="lap" stroke="#aaa" />
            <YAxis
              stroke="#aaa"
              unit="s"
              domain={["dataMin - 2", "dataMax + 2"]}
              allowDecimals={false}
            />
            <Tooltip />
            {shownDrivers.map(
              (d) =>
                !hiddenDrivers.includes(d) && (
                  <Line
                    key={d}
                    type="monotone"
                    dataKey={d}
                    stroke={getDriverColor(d, driverTeamMap[d])}
                    strokeWidth={2}
                    dot={false}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend BELOW chart */}
      <CustomLegend
        drivers={shownDrivers}
        hiddenDrivers={hiddenDrivers}
        toggleDriver={toggleDriver}
        driverTeamMap={driverTeamMap}
      />
    </div>
  );
}
