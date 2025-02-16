import { useQuery } from "@tanstack/react-query";
import { type FC, useEffect, useState } from "react";
import { UPDATE_INTERVAL_MS } from "~/constants/widget";
import type { Color, RawWidgetProps, Region } from "~/types/widget";

export const RawWidget: FC<RawWidgetProps> = ({
  region,
  accountId,
  variable = "wins_losses_today",
  prefix = "",
  suffix = "",
  extraArgs = {},
  fontColor = "#ffffff",
  fontColorLikeRank = false,
  refreshInterval = UPDATE_INTERVAL_MS,
}) => {
  const [stat, setStat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [badgeLevel, setBadgeLevel] = useState<number | null>(null);
  const [fontColorState, setFontColor] = useState(fontColor);

  const fetchStats = async (region: Region, accountId: string, variable: string, extraArgs: Record<string, string>) => {
    const url = new URL(`https://data.deadlock-api.com/v1/commands/${region}/${accountId}/resolve-variables`);
    const variables = [variable];
    if (fontColorLikeRank) {
      variables.push("leaderboard_rank_badge_level");
    }
    url.searchParams.append("variables", variables.join(","));

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
    queryKey: ["stats", region, accountId, variable, extraArgs],
    queryFn: () => fetchStats(region, accountId, variable, extraArgs),
    staleTime: refreshInterval - 10000,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  const { data: ranksData } = useQuery<Record<string, string | number>[]>({
    queryKey: ["ranks"],
    queryFn: () => fetch("https://assets.deadlock-api.com/v2/ranks").then((res) => res.json()),
  });

  useEffect(() => {
    setLoading(statsLoading);
    if (data) {
      setStat(data[variable]);
      if ("leaderboard_rank_badge_level" in data) {
        setBadgeLevel(Number.parseInt(data.leaderboard_rank_badge_level));
      }
    }
    if (statsError) {
      setStat(null);
      console.error(`Failed to fetch stats: ${statsError}`);
    }
  }, [data, variable, statsLoading, statsError]);

  useEffect(() => {
    let newFontColor = fontColor;
    if (fontColorLikeRank && ranksData && badgeLevel) {
      const rankData = ranksData.find((r) => r.tier === Math.floor(badgeLevel / 10));
      if (rankData) {
        newFontColor = rankData.color as Color;
      }
    }
    setFontColor(newFontColor);
  }, [ranksData, badgeLevel, fontColorLikeRank, fontColor]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
            <div className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
        </div>
      ) : stat ? (
        <>
          <div className="flex gap-2 w-fit items-center">
            <div className="text-4xl font-bold" style={{ color: fontColorState }}>
              {variable.endsWith("img") ? (
                <img src={stat} alt={variable} className="h-20 rounded-full" />
              ) : (
                prefix + stat + suffix
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
