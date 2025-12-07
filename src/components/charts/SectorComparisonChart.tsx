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
import { useState } from "react";
import { getDriverColor, getTextColor } from "../../utils/colors";

// 🔹 Custom Legend Pills
const CustomLegend = ({
  drivers,
  hiddenDrivers,
  toggleDriver,
  driverTeamMap,
}: any) => (
  <div className="flex flex-wrap gap-2 justify-center mt-2">
    {drivers.map((driver: string) => {
      const color = getDriverColor(driver, driverTeamMap[driver]);
      const textColor = getTextColor(color);
      const isHidden = hiddenDrivers.includes(driver);

      return (
        <span
          key={driver}
          onClick={() => toggleDriver(driver)}
          className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer ${
            isHidden ? "opacity-40 line-through" : ""
          }`}
          style={{
            backgroundColor: color,
            color: textColor,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        >
          {driver}
        </span>
      );
    })}
  </div>
);

function SectorChart({
  data,
  drivers,
  hiddenDrivers,
  sectorKey,
  title,
  driverTeamMap,
  toggleDriver, // ✅ added as a prop
}: {
  data: any[];
  drivers: string[];
  hiddenDrivers: string[];
  sectorKey: "sector1" | "sector2" | "sector3";
  title: string;
  driverTeamMap: Record<string, string>;
  toggleDriver: (driver: string) => void;
}) {
  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-md font-semibold mb-2">{title}</h2>
      <div className="h-[300px]">
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
            {drivers.map(
              (d) =>
                !hiddenDrivers.includes(d) && (
                  <Line
                    key={`${d}-${sectorKey}`}
                    type="monotone"
                    dataKey={`${d}-${sectorKey}`}
                    stroke={getDriverColor(d, driverTeamMap[d])}
                    strokeWidth={2}
                    dot={false}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend pills below chart */}
      <CustomLegend
        drivers={drivers}
        hiddenDrivers={hiddenDrivers}
        toggleDriver={toggleDriver}
        driverTeamMap={driverTeamMap}
      />
    </div>
  );
}

export default function SectorComparisonCharts() {
  const { lapTimes, filter, driverTeamMap } = useTelemetry();
  const { season, round, drivers, lapRange } = filter;
  const [hiddenDrivers, setHiddenDrivers] = useState<string[]>([]);

  const toggleDriver = (driver: string) => {
    setHiddenDrivers((prev) =>
      prev.includes(driver) ? prev.filter((d) => d !== driver) : [...prev, driver]
    );
  };

  if (drivers.length === 0) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg shadow-lg">
        <p className="text-neutral-400">Select drivers to see sector times</p>
      </div>
    );
  }

  // Filter laps
  const filtered = lapTimes.filter(
    (l) =>
      l.season === season &&
      l.round === round &&
      drivers.includes(l.driver) &&
      l.lap_number >= lapRange[0] &&
      l.lap_number <= lapRange[1]
  );

  // Merge laps into chart data
  const merged: Record<number, any> = {};
  filtered.forEach((l) => {
    if (!merged[l.lap_number]) merged[l.lap_number] = { lap: l.lap_number };
    merged[l.lap_number][`${l.driver}-sector1`] = l.sector1;
    merged[l.lap_number][`${l.driver}-sector2`] = l.sector2;
    merged[l.lap_number][`${l.driver}-sector3`] = l.sector3;
  });
  const data = Object.values(merged).sort((a: any, b: any) => a.lap - b.lap);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SectorChart
        data={data}
        drivers={drivers}
        hiddenDrivers={hiddenDrivers}
        sectorKey="sector1"
        title="Sector 1"
        driverTeamMap={driverTeamMap}
        toggleDriver={toggleDriver} // ✅ pass down
      />
      <SectorChart
        data={data}
        drivers={drivers}
        hiddenDrivers={hiddenDrivers}
        sectorKey="sector2"
        title="Sector 2"
        driverTeamMap={driverTeamMap}
        toggleDriver={toggleDriver} // ✅ pass down
      />
      <SectorChart
        data={data}
        drivers={drivers}
        hiddenDrivers={hiddenDrivers}
        sectorKey="sector3"
        title="Sector 3"
        driverTeamMap={driverTeamMap}
        toggleDriver={toggleDriver} // ✅ pass down
      />
    </div>
  );
}
