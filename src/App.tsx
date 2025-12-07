import LapTimeFilters from "./components/filters/LapTimeFilters";
import LapTimeChart from "./components/charts/LapTimeChart";
import { TelemetryProvider } from "./context/TelemetryContext";
import Header from "./components/layout/Header";
import SectorComparisonChart from "./components/charts/SectorComparisonChart";
import PitStopChart from "./components/charts/PitStopChart";
import PitStopTimeline from "./components/charts/PitStopTimeline";
import LostTimeChart from "./components/charts/LostTimeChart";
import PerformanceSummaryPanel from "./components/charts/PerformanceSummaryPanel";
import DriverPerformancePanel  from "./components/charts/DriverPerformancePanel";

function App() {
  return (
    <TelemetryProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 space-y-6">
        <Header />
        <LapTimeFilters />
        <PerformanceSummaryPanel/>
        <DriverPerformancePanel/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <LapTimeChart /> 
        <LostTimeChart />
        </div>
        <div className="grid grid-cols-1:grid-cols-1 mb-6">
          <SectorComparisonChart /> 
        </div>
        
        <PitStopChart /> 
        <PitStopTimeline />
      </div>
    </TelemetryProvider>
  );
}

export default App;
