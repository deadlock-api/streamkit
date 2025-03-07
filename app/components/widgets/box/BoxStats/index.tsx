import { StatDisplay } from "~/components/widgets/StatDisplay";
import type { BoxStatsProps } from "./BoxStats.types";

/**
 * Component for displaying the stats section of the BoxWidget
 */
export const BoxStats = ({ stats, theme, loading }: BoxStatsProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
          <div className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2">
      {stats.map((stat, index) => (
        <StatDisplay key={`${stat.variable}-${index}`} stat={stat} theme={theme} />
      ))}
    </div>
  );
};
