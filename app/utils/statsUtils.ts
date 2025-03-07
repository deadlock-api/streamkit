import { snakeToPretty } from "~/lib/utils";
import type { Stat } from "~/types/widget";

/**
 * Converts variables and their values into a structured stats array
 */
export const createStatDisplays = (
  stats: Record<string, string> | null,
  variables: string[],
  displayLabels: string[],
  opacity = 100,
): Stat[] => {
  if (!stats) return [];

  return variables.map((variable, index) => ({
    variable,
    value: stats[variable],
    label: displayLabels[index] || snakeToPretty(variable),
    opacity,
  }));
};

/**
 * Calculate number of matches to display based on configuration
 */
export const calculateMatchesToShow = (
  numMatches: number,
  matchHistoryShowsToday: boolean,
  stats: Record<string, string> | null,
): number => {
  if (!matchHistoryShowsToday) return numMatches;

  return Number.parseInt(stats?.matches_today ?? "0");
};
