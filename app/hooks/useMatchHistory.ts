import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Hero, Match, UseMatchHistoryResult } from "~/components/widgets/MatchHistory/MatchHistory.types";
import { UPDATE_INTERVAL_MS } from "~/constants/widget";

interface UseMatchHistoryParams {
  accountId: string;
  numMatches?: number;
  refresh?: number;
}

/**
 * Custom hook to fetch and manage match history data
 */
export const useMatchHistory = ({
  accountId,
  numMatches = 10,
  refresh = 0,
}: UseMatchHistoryParams): UseMatchHistoryResult => {
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

  // Process heroes data when it changes
  useEffect(() => {
    if (heroesData) {
      setHeroes(new Map(heroesData.map((h) => [h.id, h.images.icon_hero_card_webp])));
    }
    if (heroesError) {
      console.error("Failed to fetch heroes:", heroesError);
      setHeroes(new Map());
    }
  }, [heroesData, heroesError]);

  // Process matches data when it changes or when refresh is triggered
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (matchesError) {
      console.error("Failed to fetch matches:", matchesError);
    } else if (matchesData) {
      setMatches(matchesData?.slice(0, numMatches));
    }
  }, [matchesData, matchesError, numMatches, refresh]);

  // Update loading state
  useEffect(() => {
    setLoading(loadingHeroes || loadingMatches);
  }, [loadingHeroes, loadingMatches]);

  return { matches, heroes, loading };
};
