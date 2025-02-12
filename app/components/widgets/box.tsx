import { useQuery } from "@tanstack/react-query";
import { type FC, useEffect, useState } from "react";
import { DEFAULT_LABELS, DEFAULT_VARIABLES, THEME_STYLES, UPDATE_INTERVAL_MS } from "~/constants/widget";
import { cn, snakeToPretty } from "~/lib/utils";
import type { BoxWidgetProps, Region, Stat } from "~/types/widget";
import { MatchHistory } from "./MatchHistory";
import { StatDisplay } from "./StatDisplay";

export const BoxWidget: FC<BoxWidgetProps> = ({
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
}) => {
  const [stats, setStats] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshChildren, setRefreshChildren] = useState(0);

  // Always include steam_account_name in API call if showHeader is true
  const auxiliaryVariables: string[] = [];
  if (showHeader) auxiliaryVariables.push("steam_account_name");
  if (matchHistoryShowsToday) auxiliaryVariables.push("matches_today");

  const displayLabels = labels ? labels : variables.map(snakeToPretty);

  const fetchStats = async (
    region: Region,
    accountId: string,
    variables: string[],
    extraArgs: Record<string, string>,
  ) => {
    const url = new URL(`https://data.deadlock-api.com/v1/commands/${region}/${accountId}/resolve-variables`);
    url.searchParams.append("variables", [...variables, ...auxiliaryVariables].join(","));

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.entries(extraArgs).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
    const res = await fetch(url);
    return await res.json();
  };

  const {
    data,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<Record<string, string>>({
    queryKey: ["stats", region, accountId, variables, extraArgs],
    queryFn: () => fetchStats(region, accountId, variables, extraArgs),
    staleTime: refreshInterval - 10000,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    setLoading(statsLoading);
    if (data) {
      setRefreshChildren((prev) => prev + 1);
      setStats(data);
    }
    if (statsError) {
      setStats(null);
      console.error(`Failed to fetch stats: ${statsError}`);
    }
  }, [data, statsLoading, statsError]);

  const getStatDisplays = (): Stat[] => {
    if (!stats) return [];

    return variables.map((variable, index) => ({
      variable,
      value: stats[variable],
      label: displayLabels[index] || snakeToPretty(variable),
      opacity,
    }));
  };

  const shouldShowHeader = showHeader && stats?.steam_account_name;

  let numMatchesToShow: number = numMatches;
  if (matchHistoryShowsToday) {
    numMatchesToShow = Number.parseInt(stats?.matches_today ?? "0");
  }

  const getBackgroundStyle = () => {
    if (theme === "glass") return "bg-black/10 backdrop-blur-md";

    if (theme === "light") {
      return cn("[background:rgba(255,255,255,var(--bg-opacity))]", "border-gray-100/5");
    }

    return cn("[background:rgba(26,27,30,var(--bg-opacity))]", "border-white/[0.03]");
  };

  const getHeaderStyle = () => {
    if (theme === "glass") return "bg-white/5";

    if (theme === "light") {
      return cn(
        "[background:linear-gradient(to_right,rgba(255,255,255,var(--bg-opacity)),rgba(249,250,251,var(--bg-opacity)))]",
        "border-b border-gray-900/5",
      );
    }

    return cn(
      "[background:linear-gradient(to_right,rgba(26,27,30,var(--bg-opacity)),rgba(37,38,43,var(--bg-opacity)))]",
      "border-b border-white/[0.03]",
    );
  };

  return (
    <div className="inline-block" style={{ "--bg-opacity": opacity / 100 } as React.CSSProperties}>
      {showMatchHistory && (
        <div className="flex">
          <div className="grow-1 w-0 overflow-clip">
            <MatchHistory
              theme={theme}
              refresh={refreshChildren}
              numMatches={numMatchesToShow}
              accountId={accountId}
              opacity={opacity}
            />
          </div>
        </div>
      )}
      <div
        className={cn(
          "inline-flex flex-col",
          "rounded-b-xl",
          getBackgroundStyle(),
          theme !== "glass" && "border",
          showMatchHistory ? "border-t-0" : "rounded-t-xl",
          "shadow-lg",
          THEME_STYLES[theme].container,
        )}
      >
        {shouldShowHeader && (
          <div
            className={cn(
              !showMatchHistory && "rounded-t-xl",
              "px-4 py-3",
              getHeaderStyle(),
              "relative",
              THEME_STYLES[theme].header,
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[13px] font-medium tracking-wide",
                  theme === "light" ? "text-gray-900" : "text-white/90",
                )}
              >
                {stats.steam_account_name}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-medium text-green-500/90">LIVE</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-2 w-fit space-y-1">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                <div className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="flex gap-2 w-fit items-center">
                {getStatDisplays().map((stat) => (
                  <StatDisplay key={stat.label} stat={stat} theme={theme} className="flex-none" />
                ))}
              </div>

              {showBranding && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <div
                    className={cn(
                      "h-px flex-1 bg-gradient-to-r from-transparent to-transparent",
                      theme === "light" ? "via-gray-200/50" : theme === "glass" ? "via-white/10" : "via-white/5",
                    )}
                  />
                  <a
                    href="https://deadlock-api.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
                      theme === "light"
                        ? "bg-gray-100/50 hover:bg-gray-100"
                        : theme === "glass"
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px] font-medium transition-all",
                        theme === "light" ? "text-gray-500" : "text-white/50",
                      )}
                    >
                      Widget by
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold transition-all",
                        theme === "light"
                          ? "text-gray-600 group-hover:text-gray-900"
                          : "text-white/70 group-hover:text-white",
                      )}
                    >
                      deadlock-api.com
                    </span>
                  </a>
                  <div
                    className={cn(
                      "h-px flex-1 bg-gradient-to-r from-transparent to-transparent",
                      theme === "light" ? "via-gray-200/50" : theme === "glass" ? "via-white/10" : "via-white/5",
                    )}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
