// Official-ish F1 2024 team colors (primary, secondary)
const teamColors: Record<string, string[]> = {
  "Red Bull Racing": ["#3671C6", "#FF004C"],
  "Ferrari": ["#E80020", "#FFF200"],
  "Mercedes": ["#27F4D2", "#c6dddcff"],
  "McLaren": ["#FF8000", "#e0ff56ff"],
  "Aston Martin": ["#229971", "#FFFEFD"],
  "Williams": ["#64C4FF", "#FFFFFF"],
  "Alpine": ["#0093CC", "#FF5F9E"],
  "Kick Sauber": ["#52E252", "#FFFFFF"],  // Stake / Sauber
  "Haas": ["#B6BABD", "#3b2727ff"],
  "RB": ["#6692FF", "#707070ff"],         // RB = VCARB = Visa Cash App Racing Bulls
};

// Store driverId → assigned color
const driverColorMap: Record<string, string> = {};

export function getDriverColor(driverId: string, team?: string): string {
      
  if (driverColorMap[driverId] && driverColorMap[driverId] !== "#8884d8") {
    return driverColorMap[driverId];
  }

  if (team && teamColors[team]) {
    const [primary, secondary] = teamColors[team];
  
    // check which team colors are already taken
    const assigned = Object.entries(driverColorMap)
      .filter(([_, c]) => [primary, secondary].includes(c))
      .map(([_, c]) => c);

    if (!assigned.includes(primary)) {
      driverColorMap[driverId] = primary;
    } else {
      driverColorMap[driverId] = secondary;
    }
  } else {
    console.log("No team or unknown team for driver", driverId, team);
    // fallback
    return "#8884d8";
  }

  return driverColorMap[driverId];
}

export function getTextColor(bgColor: string): string {
  if (!bgColor) return "#fff";

  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#000" : "#fff"; // light bg = black text, dark bg = white text
}
