import { StatDisplay } from "~/components/widgets/StatDisplay";
import type { BoxStatsProps } from "./BoxStats.types";

/**
 * Component for displaying the stats section of the BoxWidget
 */
export const BoxStats = ({ stats, theme, loading }: BoxStatsProps) => {
  if (loading) return <div className="flex justify-center py-3">Loading stats...</div>;

  if (!stats.length) return <div className="flex justify-center py-3">No stats available</div>;

  return (
    <div className="flex flex-wrap gap-1 p-2">
      {stats.map((stat, index) => (
        <StatDisplay key={`${stat.variable}-${index}`} stat={stat} theme={theme} />
      ))}
    </div>
  );
};
