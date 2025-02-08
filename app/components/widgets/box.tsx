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
  theme = "default",
  showHeader = true,
  refreshInterval = UPDATE_INTERVAL_MS,
  showBranding = true,
  showMatchHistory = false,
}) => {
  const [stats, setStats] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshChildren, setRefreshChildren] = useState(0);

  // Always include steam_account_name in API call if showHeader is true
  const apiVariables = showHeader ? Array.from(new Set([...variables, "steam_account_name"])) : variables;

  // Filter out steam_account_name from display variables
  const displayVariables = variables.filter((v) => v !== "steam_account_name");
  const displayLabels = labels
    ? labels.filter((_, i) => variables[i] !== "steam_account_name")
    : displayVariables.map(snakeToPretty);

  const fetchStats = async (
    region: Region,
    accountId: string,
    apiVariables: string[],
    extraArgs: Record<string, string>,
  ) => {
    if (!region || !accountId) {
      setError("Region and Account ID are required");
      setLoading(false);
      return;
    }

    try {
      const url = new URL(`https://data.deadlock-api.com/v1/commands/${region}/${accountId}/resolve-variables`);
      url.searchParams.append("variables", apiVariables.join(","));

      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.entries(extraArgs).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (JSON.stringify(data) === JSON.stringify(stats)) return;
        setRefreshChildren((prev) => prev + 1);
        setStats(data);
        setError(null);
      } else {
        setStats(null);
        setError(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchStats(region, accountId, apiVariables, extraArgs);

    if (refreshInterval > 0) {
      const intervalId = setInterval(() => fetchStats(region, accountId, apiVariables, extraArgs), refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [region, accountId, apiVariables, extraArgs, refreshInterval]);

  const getStatDisplays = (): Stat[] => {
    if (!stats) return [];

    return displayVariables.map((variable, index) => ({
      variable,
      value: stats[variable],
      label: displayLabels[index] || snakeToPretty(variable),
    }));
  };

  const shouldShowHeader = showHeader && stats?.steam_account_name;

  return (
    <div className="inline-block">
      {showMatchHistory && (
        <div className="flex">
          <div className="grow-1 w-0 overflow-clip">
            <MatchHistory refresh={refreshChildren} theme={theme} accountId={accountId} />
          </div>
        </div>
      )}
      <div
        className={cn(
          "inline-flex flex-col",
          "rounded-b-xl transition-all duration-300",
          !showMatchHistory && "rounded-t-xl",
          theme === "light"
            ? "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/50"
            : theme === "glass"
              ? "bg-black/10 backdrop-blur-md"
              : "bg-gradient-to-br from-[#1A1B1E] via-[#1E1F23] to-[#25262B] border-white/[0.03]",
          theme !== "glass" && "border",
          "shadow-lg",
          THEME_STYLES[theme].container,
        )}
      >
        {shouldShowHeader && (
          <div
            className={cn(
              !showMatchHistory && "rounded-t-xl",
              "px-4 py-3",
              theme === "light"
                ? "bg-gradient-to-r from-white to-gray-50 border-b border-gray-200/50"
                : theme === "glass"
                  ? "bg-white/5"
                  : "bg-gradient-to-r from-[#1A1B1E] to-[#25262B] border-b border-white/[0.03]",
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

        <div className="p-3 w-fit space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                <div className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-2">
              <p className="text-red-400 font-medium text-xs">{error}</p>
              <button
                type="button"
                onClick={() => fetchStats(region, accountId, apiVariables, extraArgs)}
                className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
              >
                Retry
              </button>
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
