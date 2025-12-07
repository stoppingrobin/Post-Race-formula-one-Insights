# F1 Post Race Insights

---

## ✨ Features

- **Lap Time Analysis**  
  Interactive comparison of lap times between drivers with toggleable driver selection.

- **Sector Comparison**  
  Separate charts for S1, S2, and S3, with custom legend pills for visibility toggling.

- **Pit Stop Insights**  
  - Duration comparison  
  - Lost time analysis (pit duration + out-lap delta vs baseline)  
  - Stint visualization (tyre usage by lap)

- **Performance Metrics**  
  - Overall fastest lap  
  - Average pace (overall + per driver selection)  
  - Consistency scores  
  - Driver performance cards

- **Filtering Options**  
  - Season & event selection  
  - Driver filters (multi-select)  
  - Lap range filtering  

- **UI/UX**  
  - Dark mode, F1-inspired styling  
  - Responsive layout with TailwindCSS  
  - Interactive tooltips & custom legends  

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Styling:** TailwindCSS  
- **Charts:** Recharts  
- **State Management:** React Context (`TelemetryContext`)  
- **Testing:** Vitest + React Testing Library  
- **Data:** Custom JSON exports from [FastF1](https://theoehrly.github.io/Fast-F1/)  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/f1-telemetry-dashboard.git
cd f1-telemetry-dashboard
```
### 2. Install dependencies
```bash
npm install
```
### 3. Start development server
```bash
npm run dev
```
The app will run at http://localhost:5173

## 📂 Project Structure
```bash
src/
 ├─ components/
 │   ├─ charts/            # Lap times, pit stops, sector charts
 │   ├─ dashboard/         # Stat cards, performance panels
 │   ├─ filters/           # Filter panel (season, event, drivers, lap range)
 │   └─ ui/                # Reusable UI elements (Card, Button, Select)
 ├─ context/
 │   └─ TelemetryContext.tsx
 ├─ services/
 │   ├─ dataService.ts     # Loads JSON lap/pitstop data
 │   ├─ lostTimeService.ts # Lost time calculations
 │   └─ performanceService.ts
 ├─ types/
 │   └─ f1.d.ts            # Type definitions
 ├─ utils/
 │   └─ colors.ts          # Team & driver color management
 ├─ App.tsx
 └─ main.tsx
```


## 📊 Data

The app consumes pre-exported JSON files created via Python + FastF1
.
See dataService.ts
 for how lap times and pit stops are loaded.

Example JSON schema (lap times):
```bash
{
  "season": 2024,
  "round": 14,
  "event": "Italian Grand Prix",
  "driver": "VER",
  "driver_fullname": "Max Verstappen",
  "team": "Red Bull Racing",
  "lap_number": 20,
  "lap_time": 81.123,
  "sector1": 25.111,
  "sector2": 28.333,
  "sector3": 27.679,
  "compound": "MEDIUM",
  "isPersonalBest": false
}
```

## 📝 TODO / Roadmap

- [ ] **Data Handling**
  - Import live telemetry directly from [FastF1](https://theoehrly.github.io/Fast-F1/) instead of static JSON.
  - Add caching and session-based loading to reduce load times.
  - Support multiple seasons beyond 2024-2025.

- [ ] **Charts & Analysis**
  - Add performance drop-offs.
  - Improve Lap Time chart with zoom/pan controls.
  - Add tyre degradation models (pace drop-off visualization).
  - Stint analysis bands with compound usage across race distance.
  - Compare multiple races or sessions side by side.

- [ ] **Strategy Tools**
  - More advanced pit strategy optimizer (multi-stint planning).
  - Undercut/overcut simulations.
  - Fuel and weather impact models.

- [ ] **Driver Performance**
  - Expand consistency score into percentile ranking.
  - Add pace delta vs teammate benchmark.
  - Include race result integration (finishing position, points).

- [ ] **UI/UX**
  - Global shared legend for all charts (mobile-friendly).
  - Add light mode toggle.
  - Improve responsiveness for small devices.
  - Add keyboard shortcuts (driver toggling, lap range selection).

- [ ] **Infrastructure**
  - Add unit tests for services (lap filtering, lost time calculation, strategy).
  - Setup CI/CD (GitHub Actions) for linting, testing, and builds.

- [ ] **Future Ideas**
  - Real-time data mode (streaming during live sessions).
  - Driver telemetry overlays (speed, throttle, brake traces).
  - Export charts as images/PDF for reports.

## 🤝 Contributing

Contributions, ideas, and feedback are welcome!
Fork the repo and submit a pull request, or open an issue.
  
