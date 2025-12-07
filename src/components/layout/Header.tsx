import { useTelemetry } from "../../context/TelemetryContext";
import {BasicClock} from "../utils/clock/BasicClock.tsx";
import f1Logo from '../../assets/f1-logo.svg'

export default function Header() {
  const { filter, lapTimes } = useTelemetry();
  const { season, round } = filter;

  // find event name for current season/round
  const eventName =
    lapTimes.find((l) => l.season === season && l.round === round)?.event ||
    "Select race";

  return (
    <header className="bg-neutral-800 flex items-center gap-3 px-6 py-4 rounded-lg shadow">
      {/* Logo/Icon */}
      <div className="bg-white-600 w-10 h-10 flex items-center justify-center rounded">
        <div className="h-full w-full flex items-center">
            <img src={f1Logo} alt="F1 logo"/>
        </div>
      </div>

      {/* Title + subtitle */}
      <div className="w-full flex flex-row justify-between items-center p-2">
          <div>
              <h1 className="text-lg font-bold">F1 Post Race Insight Panel</h1>
              <p className="text-sm text-neutral-300">
                  SELECTED RACE : {eventName}
              </p>
          </div>

          <div>
            <BasicClock/>
          </div>

      </div>
    </header>
  );
}
