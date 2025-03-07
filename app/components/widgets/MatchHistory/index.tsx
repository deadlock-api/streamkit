import { type FC } from "react";
import { cn } from "~/lib/utils";
import { MatchHistoryProps } from "./MatchHistory.types";
import { MatchItem } from "./MatchItem";
import { useMatchHistory } from "./useMatchHistory";

/**
 * Component for displaying a player's match history
 */
export const MatchHistory: FC<MatchHistoryProps> = ({ 
  theme, 
  numMatches = 10, 
  accountId, 
  refresh = 0, 
  opacity = 100 
}) => {
  const { matches, heroes, loading } = useMatchHistory({
    accountId,
    numMatches,
    refresh,
  });

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

        return (
          <MatchItem 
            key={match.match_id} 
            match={match} 
            heroImage={heroImage} 
          />
        );
      })}
    </div>
  );
}; 