import { useMemo } from "react";
import { useTelemetry } from "../../context/TelemetryContext";
import { getSeasons, getRounds, getDrivers } from "../../services/dataService";
import { RotateCcw, CheckSquare } from "lucide-react";

export default function LapTimeFilters() {
  const { lapTimes, filter, setFilter } = useTelemetry();
  const { season, round, drivers, lapRange, showDropOffs } = filter;

  // Compute options safely, even if lapTimes is empty
  const seasons = useMemo(() => (lapTimes.length ? getSeasons(lapTimes) : []), [lapTimes]);
  const rounds = useMemo(
    () => (lapTimes.length ? getRounds(lapTimes, season) : []),
    [lapTimes, season]
  );
  const driverOptions = useMemo(
    () => (lapTimes.length ? getDrivers(lapTimes, season, round) : []),
    [lapTimes, season, round]
  );

  const maxLap = useMemo(() => {
    if (!lapTimes.length) return 1;
    const laps = lapTimes.filter((l) => l.season === season && l.round === round);
    return laps.length ? Math.max(...laps.map((l) => l.lap_number), 1) : 1;
  }, [lapTimes, season, round]);

  // Show placeholder while no data
  if (!lapTimes.length || !seasons.length || !rounds.length) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg">
        Loading filters…
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-lg font-semibold mb-4">Filters &amp; Settings</h2>

      {/* Row 1: Season, Event, Lap Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Season */}
        <div>
          <label className="block text-sm font-medium mb-1">Season</label>
          <select
            value={season}
            onChange={(e) => {
              const newSeason = Number(e.target.value);
              const newRound = getRounds(lapTimes, newSeason)[0]?.round || 1;
              setFilter({
                ...filter,
                season: newSeason,
                round: newRound,
                drivers: [],
                lapRange: [1, maxLap],
              });
            }}
            className="bg-neutral-800 px-2 py-1 rounded w-full"
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Event */}
        <div>
          <label className="block text-sm font-medium mb-1">Event</label>
          <select
            value={round}
            onChange={(e) => {
              const newRound = Number(e.target.value);
              setFilter({
                ...filter,
                round: newRound,
                drivers: [],
                lapRange: [1, maxLap],
              });
            }}
            className="bg-neutral-800 px-2 py-1 rounded w-full"
          >
            {rounds.map((r) => (
              <option key={r.round} value={r.round}>
                {r.round} – {r.event}
              </option>
            ))}
          </select>
        </div>

        {/* Lap Range */}
        <div>
          <label className="block text-sm font-medium mb-1">Lap Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={lapRange[1]}
              value={lapRange[0]}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  lapRange: [Number(e.target.value), lapRange[1]],
                })
              }
              className="bg-neutral-800 px-2 py-1 rounded w-20"
            />
            <span>-</span>
            <input
              type="number"
              min={lapRange[0]}
              max={maxLap}
              value={lapRange[1]}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  lapRange: [lapRange[0], Number(e.target.value)],
                })
              }
              className="bg-neutral-800 px-2 py-1 rounded w-20"
            />
            <span className="text-neutral-400"> Maximum laps: {maxLap} </span>
          </div>
        </div>
      </div>

      {/* Row 2: Drivers */}
      <div>
        <label className="block text-sm font-medium ">Drivers</label>
          <label className="block text-xs mb-1 text-neutral-400">Click on driver/drivers for specific insight</label>
        <div className="flex flex-wrap gap-2">
          {driverOptions.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setFilter({
                  ...filter,
                  drivers: drivers.includes(d.id)
                    ? drivers.filter((x) => x !== d.id)
                    : [...drivers, d.id],
                });
              }}
              className={`px-3 py-1 rounded text-sm ${
                drivers.includes(d.id)
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
              }`}
            >
              {d.name} ({d.id})
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Settings */}
      <div className="flex items-center justify-between border-t border-neutral-700 pt-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showDropOffs}
            onChange={(e) =>
              setFilter({ ...filter, showDropOffs: e.target.checked })
            }
            className="hidden"
          />
          <CheckSquare
            size={16}
            className={showDropOffs ? "text-blue-500" : "text-neutral-500"}
          />
          Show performance drop-offs
        </label>

        <button
          onClick={() => {
            setFilter({
              ...filter,
              drivers: [],
              lapRange: [1, maxLap],
              showDropOffs: false,
            });
          }}
          className="flex items-center gap-1 text-sm bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
