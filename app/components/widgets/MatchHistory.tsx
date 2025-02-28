import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { UPDATE_INTERVAL_MS } from "~/constants/widget";
import { cn } from "~/lib/utils";
import type { Hero, Match, MatchHistoryProps } from "~/types/match-history";

export const MatchHistory: FC<MatchHistoryProps> = ({ theme, numMatches, accountId, refresh, opacity = 100 }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [heroes, setHeroes] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const {
    data: heroesData,
    isLoading: loadingHeroes,
    error: heroesError,
  } = useQuery<Hero[]>({
    queryKey: ["heroes"],
    queryFn: () => fetch("https://assets.deadlock-api.com/v2/heroes").then((res) => res.json()),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const {
    data: matchesData,
    isLoading: loadingMatches,
    error: matchesError,
  } = useQuery<Match[]>({
    queryKey: ["match-history", accountId],
    queryFn: () =>
      fetch(`https://api.deadlock-api.com/v1/players/${accountId}/match-history`).then((res) => res.json()),
    staleTime: UPDATE_INTERVAL_MS - 10000,
    refetchInterval: UPDATE_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (heroesData) setHeroes(new Map(heroesData.map((h) => [h.id, h.images.icon_hero_card_webp])));
    if (heroesError) {
      console.error("Failed to fetch heroes:", heroesError);
      setHeroes(new Map());
    }
  }, [heroesData, heroesError]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (matchesError) {
      console.error("Failed to fetch matches:", matchesError);
    } else if (matchesData) {
      setMatches(matchesData?.slice(0, numMatches ?? 10));
    }
  }, [refresh, matchesData, matchesError, numMatches]);

  useEffect(() => {
    setLoading(loadingHeroes || loadingMatches);
  }, [loadingHeroes, loadingMatches]);

  if (loading) return null;

  return (
    <div
      style={{ "--bg-opacity": opacity / 100 } as React.CSSProperties}
      className={cn(
        "flex gap-0.5 justify-start items-center h-9 rounded-t-xl pt-1 border border-b-0 border-white/[0.03]",
        theme === "light"
          ? "[background:rgba(255,255,255,var(--bg-opacity))]"
          : theme === "glass"
            ? "bg-white/5"
            : "[background:rgba(26,27,30,var(--bg-opacity))]",
      )}
    >
      {[...matches].map((match) => {
        const heroImage = heroes.get(match.hero_id);
        if (!heroImage) return null;

        const isWin = match.match_result === match.player_team;

        return (
          <div key={match.match_id} className="relative min-w-8 w-8 text-center">
            <img
              src={heroImage}
              alt={`Match ${isWin ? "Win" : "Loss"}`}
              className="rounded-[2px] object-cover ml-auto mr-auto h-auto w-auto"
              style={{ maxWidth: "80%" }}
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 h-8",
                "bg-gradient-to-t from-current to-transparent opacity-20",
                isWin ? "text-emerald-500" : "text-red-500",
              )}
            />
            <div className={cn("absolute bottom-0 left-0 right-0 h-[3px]", isWin ? "bg-emerald-500" : "bg-red-500")} />
          </div>
        );
      })}
    </div>
  );
};
