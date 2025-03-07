import { useMemo } from "react";
import { MatchHistory } from "~/components/widgets/MatchHistory";
import { DEFAULT_LABELS, DEFAULT_VARIABLES, UPDATE_INTERVAL_MS } from "~/constants/widget";
import { useStats } from "~/hooks/useStats";
import { useWidgetTheme } from "~/hooks/useWidgetTheme";
import type { BoxWidgetProps } from "~/types/widget";
import { calculateMatchesToShow, createStatDisplays } from "~/utils/statsUtils";
import { BoxBranding } from "./BoxBranding";
import { BoxHeader } from "./BoxHeader";
import { BoxStats } from "./BoxStats";

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
  const numMatchesToShow = useMemo(() => {
    return calculateMatchesToShow(numMatches, matchHistoryShowsToday, stats);
  }, [numMatches, matchHistoryShowsToday, stats]);

  // Create stat display objects
  const statDisplays = useMemo(() => {
    return createStatDisplays(stats, variables, displayLabels, opacity);
  }, [stats, variables, displayLabels, opacity]);

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
            themeClasses={{
              headerClasses: themeStyles.headerClasses,
              userNameClasses: themeStyles.userNameClasses,
            }}
          />
        )}

        <div className="p-2 w-fit space-y-1">
          <BoxStats stats={statDisplays} theme={theme} loading={loading} />

          <BoxBranding
            show={showBranding && !loading && !!stats}
            themeClasses={{
              brandingDividerClasses: themeStyles.brandingDividerClasses,
              brandingLinkClasses: themeStyles.brandingLinkClasses,
              brandingTextClasses: themeStyles.brandingTextClasses,
            }}
          />
        </div>
      </div>
    </div>
  );
};
