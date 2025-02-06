export const UPDATE_INTERVAL_MS = 2 * 60 * 1000;

export const DEFAULT_VARIABLES = ["leaderboard_place", "leaderboard_rank", "wins_losses_today", "total_kd"];

export const DEFAULT_LABELS = ["Place", "Rank", "Daily W-L", "K/D"];

export const THEME_STYLES = {
  default: {
    container: "bg-[#1A1B1E]",
    header: "text-white/90",
    stat: "bg-[#25262B] hover:bg-[#2C2E33]",
  },
  dark: {
    container: "bg-[#1A1B1E]",
    header: "text-white/90",
    stat: "bg-[#25262B] hover:bg-[#2C2E33]",
  },
  light: {
    container: "bg-white",
    header: "text-gray-900",
    stat: "bg-gray-50 hover:bg-gray-100",
  },
  glass: {
    container: "bg-black/10",
    header: "text-white",
    stat: "bg-white/5 hover:bg-white/10",
  },
} as const;
