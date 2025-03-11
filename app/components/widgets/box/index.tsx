import { useMemo } from "react";
import { MatchHistory } from "~/components/widgets/MatchHistory";
import { DEFAULT_LABELS, DEFAULT_VARIABLES, UPDATE_INTERVAL_MS } from "~/constants/widget";
import { useStats } from "~/hooks/useStats";
import { useWidgetTheme } from "~/hooks/useWidgetTheme";
import { snakeToPretty } from "~/lib/utils";
import type { BoxWidgetProps, Stat } from "~/types/widget";
import { BoxBranding } from "./BoxBranding";
import { BoxHeader } from "./BoxHeader";
import { BoxStats } from "./BoxStats";

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

export const calculateMatchesToShow = (
  numMatches: number,
  matchHistoryShowsToday: boolean,
  stats: Record<string, string> | null,
): number => {
  if (!matchHistoryShowsToday) return numMatches;

  return Number.parseInt(stats?.matches_today ?? "0");
};

/**
 * Main BoxWidget component that displays player stats in a structured layout
 */
export const BoxWidget = ({
  region,
  accountId,
  variables = DEFAULT_VARIABLES,
  labels = DEFAULT_LABELS,
  extraArgs = {},
  theme = "dark",
  showHeader = true,
  refreshInterval = UPDATE_INTERVAL_MS,
  showBranding = true,
  showMatchHistory = false,
  matchHistoryShowsToday = true,
  numMatches = 10,
  opacity = 100,
}: BoxWidgetProps) => {
  // Prepare auxiliary variables based on settings
  const auxiliaryVariables = useMemo(() => {
    const vars: string[] = [];
    if (showHeader) vars.push("steam_account_name");
    if (matchHistoryShowsToday) vars.push("matches_today");
    return vars;
  }, [showHeader, matchHistoryShowsToday]);

  // Get display labels
  const displayLabels = useMemo(() => {
    return labels || variables.map((v) => v);
  }, [labels, variables]);

  // Fetch stats data
  const { stats, loading, refreshTrigger } = useStats({
    region,
    accountId,
    variables,
    auxiliaryVariables,
    extraArgs,
    refreshInterval,
  });

  // Get theme-related styles
  const themeStyles = useWidgetTheme(theme, opacity);

  // Calculate number of matches to show
  const numMatchesToShow = useMemo(
    () => calculateMatchesToShow(numMatches, matchHistoryShowsToday, stats),
    [numMatches, matchHistoryShowsToday, stats],
  );

  // Create stat display objects
  const statDisplays = useMemo(
    () => createStatDisplays(stats, variables, displayLabels, opacity),
    [stats, variables, displayLabels, opacity],
  );

  // Determine if header should be shown
  const shouldShowHeader = showHeader && stats?.steam_account_name;

  return (
    <div className="inline-block" style={themeStyles.cssVariables}>
      {showMatchHistory && (
        <div className="flex">
          <div className="grow w-0 overflow-clip">
            <MatchHistory
              theme={theme}
              refresh={refreshTrigger}
              numMatches={numMatchesToShow}
              accountId={accountId}
              opacity={opacity}
            />
          </div>
        </div>
      )}
      <div className={themeStyles.containerClasses(showMatchHistory)}>
        {shouldShowHeader && (
          <BoxHeader
            userName={stats?.steam_account_name || ""}
            showMatchHistory={showMatchHistory}
            themeClasses={themeStyles}
          />
        )}

        <div className="p-2 w-fit space-y-1">
          <BoxStats stats={statDisplays} theme={theme} loading={loading} />

          {showBranding && <BoxBranding themeClasses={themeStyles} />}
        </div>
      </div>
    </div>
  );
};
