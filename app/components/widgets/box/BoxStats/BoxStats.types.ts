import type { Stat, Theme } from "~/types/widget";

/**
 * Props for the BoxStats component
 */
export interface BoxStatsProps {
  /** Array of stats to display */
  stats: Stat[];
  /** Visual theme to apply */
  theme: Theme;
  /** Whether data is currently loading */
  loading: boolean;
}
