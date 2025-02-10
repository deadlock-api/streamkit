import type { FC } from "react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import type { Hero, Match, MatchHistoryProps } from "~/types/match-history";

export const MatchHistory: FC<MatchHistoryProps> = ({ numMatches, accountId, refresh }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [heroes, setHeroes] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh is used to trigger a refresh from the parent
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const response = await fetch("https://assets.deadlock-api.com/v2/heroes");
        const heroesData: Hero[] = await response.json();
        const heroMap = new Map(heroesData.map((hero) => [hero.id, hero.images.icon_hero_card_webp]));
        setHeroes(heroMap);
      } catch (error) {
        console.error("Failed to fetch heroes:", error);
      }
    };

    const fetchMatches = async () => {
      try {
        const response = await fetch(`https://data.deadlock-api.com/v2/players/${accountId}/match-history`);
        const data = await response.json();
        const recentMatches = data.matches.slice(0, numMatches ?? 10).reverse();
        setMatches(recentMatches);
      } catch (error) {
        console.error("Failed to fetch match history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes().then(() => fetchMatches());
  }, [refresh, accountId, numMatches]);

  if (loading || matches.length === 0) return null;

  return (
    <div className="flex gap-0.5 justify-end">
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
                "bg-gradient-to-t from-current to-transparent opacity-30  rounded-t-xl",
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
