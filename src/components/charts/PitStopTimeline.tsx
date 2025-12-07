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

// F1 compound colors
const compoundColors: Record<string, string> = {
  soft: "#FF1801",
  medium: "#FFD12E",
  hard: "#FFFFFF",
  intermediate: "#39B54A",
  wet: "#00AEEF",
};

type Stint = {
  startLap: number;
  endLap: number;
  compound: string;  // normalized lower-case
};

export default function PitStopStintBands() {
  const { lapTimes, pitStops, filter } = useTelemetry();
  const { season, round, drivers } = filter;

  // Max lap in the selected event
  const eventLaps = lapTimes.filter(
    (l) => l.season === season && l.round === round
  );
  const maxLap =
    eventLaps.length ? Math.max(...eventLaps.map((l) => l.lap_number)) : 1;

  // Build a quick map for "starting compound" from lapTimes (first lap we see for each driver)
  const startCompoundByDriver: Record<string, string | undefined> = {};
  for (const l of eventLaps) {
    // keep earliest lap per driver
    if (!startCompoundByDriver[l.driver] || l.lap_number < (eventLaps.find(e => e.driver===l.driver && e.lap_number === l.lap_number)?.lap_number ?? Infinity)) {
      if (l.compound) startCompoundByDriver[l.driver] = String(l.compound).toLowerCase();
    }
  }

  // Pit stops for the selected event (+ driver filter if any)
  const stops = pitStops
    .filter(
      (p) =>
        p.season === season &&
        p.round === round &&
        (drivers.length === 0 || drivers.includes(p.driverId))
    )
    .sort((a, b) => a.lapNumber - b.lapNumber);

  // Group stops by driverId
  const stopsByDriver = stops.reduce<Record<string, typeof stops>>((acc, s) => {
    (acc[s.driverId] ||= []).push(s);
    return acc;
  }, {});

  // Also include drivers who have NO stops but do have laps (so they still show one full-band stint)
  const driverRows = new Map<
    string,
    { driverId: string; driverName: string; team?: string }
  >();

  // From pit stops
  for (const s of stops) {
    driverRows.set(s.driverId, {
      driverId: s.driverId,
      driverName: s.driverName,
      team: s.team,
    });
  }

  // From lap times (if filtered drivers include someone without stops)
  for (const l of eventLaps) {
    if (drivers.length === 0 || drivers.includes(l.driver)) {
      if (!driverRows.has(l.driver)) {
        driverRows.set(l.driver, {
          driverId: l.driver,
          driverName: l.driver_fullname || l.driver,
          team: l.team,
        });
      }
    }
  }

  // Build stints for each driver
  const stintsPerDriver = new Map<string, Stint[]>();

  for (const { driverId, driverName } of driverRows.values()) {
    const ds = (stopsByDriver[driverId] || []).sort(
      (a, b) => a.lapNumber - b.lapNumber
    );

    // starting compound from laps; fallback to first stop compound; else unknown
    let currentCompound =
      startCompoundByDriver[driverId] ||
      (ds[0]?.compound ? ds[0].compound.toLowerCase() : "unknown");

    const driverStints: Stint[] = [];
    let prevStart = 1;

    for (const stop of ds) {
      const inLap = stop.lapNumber;
      // Stint runs through the in-lap on old compound
      driverStints.push({
        startLap: prevStart,
        endLap: inLap,
        compound: (currentCompound || "unknown").toLowerCase(),
      });
      // After stop, compound becomes the new one; next stint starts at inLap + 1
      currentCompound = (stop.compound || currentCompound || "unknown").toLowerCase();
      prevStart = inLap + 1;
    }

    // Last stint to race end
    if (prevStart <= maxLap) {
      driverStints.push({
        startLap: prevStart,
        endLap: maxLap,
        compound: (currentCompound || "unknown").toLowerCase(),
      });
    }

    // If no laps somehow, ensure at least a dummy
    if (!driverStints.length) {
      driverStints.push({
        startLap: 1,
        endLap: maxLap,
        compound: "unknown",
      });
    }

    // Clip/guard
    for (const s of driverStints) {
      s.startLap = Math.max(1, s.startLap);
      s.endLap = Math.min(maxLap, s.endLap);
      if (s.endLap < s.startLap) s.endLap = s.startLap;
    }

    stintsPerDriver.set(driverName, driverStints);
  }

  // Transform into one row per driver with alternating offset/length fields
  // so a single stacked bar per driver is drawn.
  type Row = { driver: string } & Record<string, number | string>;
  const rows: Row[] = [];
  let maxPairs = 0; // number of (offset,len) pairs we need to render

  for (const [driverName, stints] of stintsPerDriver.entries()) {
    const row: Row = { driver: driverName };

    let prevEnd = 0; // used to compute offsets from lap 1
    stints.forEach((st, i) => {
      // offset before this stint = distance from (prevEnd+1) to startLap
      const offset = Math.max(0, st.startLap - (prevEnd + 1));
      const len = Math.max(0, st.endLap - st.startLap + 1);

      row[`s${i}_offset`] = offset;
      row[`s${i}_len`] = len;
      row[`s${i}_compound`] = st.compound;

      prevEnd = st.endLap;
      maxPairs = Math.max(maxPairs, i + 1);
    });

    // trailing transparent offset so the total stacks to maxLap (nice axis alignment)
    const tailOffset = Math.max(0, maxLap - prevEnd);
    row[`s${stints.length}_offset`] = tailOffset;
    // no length after tail offset
    maxPairs = Math.max(maxPairs, stints.length + 1);

    rows.push(row);
  }

  // Custom tooltip for stints
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const entry = payload[0].payload as Row;
    // infer which segment index this tooltip is for via the bar index (payload[0].dataKey),
    // but Recharts doesn't give us the raw start/end lap here. We'll compute from row values.
    // Reconstruct the hovered segment's lap span from the cumulative stack up to that index.
    const dataKey: string = payload[0].dataKey || "";
    const match = dataKey.match(/^s(\d+)_len$/);
    if (!match) return null;

    const i = Number(match[1]);

    // Recompute start/end from row fields
    let cum = 0;
    for (let k = 0; k < i; k++) {
      cum += (entry[`s${k}_offset`] as number) || 0;
      cum += (entry[`s${k}_len`] as number) || 0;
    }
    const thisOffset = (entry[`s${i}_offset`] as number) || 0;
    const thisLen = (entry[`s${i}_len`] as number) || 0;
    const startLap = cum + thisOffset + 1;
    const endLap = startLap + thisLen - 1;
    const compound = String(entry[`s${i}_compound`] || "unknown");

    return (
      <div className="bg-neutral-800 p-3 rounded shadow text-sm text-white">
        <p className="font-semibold">{entry.driver}</p>
        <p>
          Laps {startLap}–{endLap}
        </p>
        <p>Compound: {compound}</p>
      </div>
    );
  };

  if (!rows.length) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg">
        <p className="text-neutral-400">No stint data available</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stints</h2>
        <p className="text-sm text-neutral-400">
          One bar per driver — colored segments show compound per lap range
        </p>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" barCategoryGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              domain={[1, Math.max(1, maxLap)]}
              allowDataOverflow
              stroke="#aaa"
              tickCount={Math.min(10, Math.max(5, Math.floor(maxLap / 7)))}
            />
            <YAxis type="category" dataKey="driver" stroke="#aaa" width={140} />
            <Tooltip content={<CustomTooltip />} />

            {/* For each stint pair, render transparent offset then colored length; all share the same stackId */}
            {Array.from({ length: maxPairs }).map((_, pairIdx) => (
              <g key={`pair-${pairIdx}`}>
                {/* offset (invisible) */}
                <Bar
                  dataKey={`s${pairIdx}_offset`}
                  stackId="stints"
                  isAnimationActive={false}
                  fill="transparent"
                />
                {/* length (colored) */}
                {pairIdx < maxPairs - 1 && (
                  <Bar
                    dataKey={`s${pairIdx}_len`}
                    stackId="stints"
                    isAnimationActive={false}
                  >
                    {rows.map((row, ri) => {
                      const comp = String(
                        row[`s${pairIdx}_compound`] || "unknown"
                      ).toLowerCase();
                      const color = compoundColors[comp] || "#888";
                      return <Cell key={`c-${pairIdx}-${ri}`} fill={color} />;
                    })}
                  </Bar>
                )}
              </g>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
