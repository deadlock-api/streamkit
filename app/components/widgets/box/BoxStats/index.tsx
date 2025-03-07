import { type FC } from "react";
import { StatDisplay } from "~/components/widgets/StatDisplay";
import { BoxStatsProps } from "./BoxStats.types";

/**
 * Component for displaying stats in the BoxWidget
 */
export const BoxStats: FC<BoxStatsProps> = ({ 
  stats, 
  theme, 
  loading 
}) => {
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
    <div className="flex gap-2 w-fit items-center">
      {stats.map((stat) => (
        <StatDisplay 
          key={stat.label} 
          stat={stat} 
          theme={theme} 
          className="flex-none" 
        />
      ))}
    </div>
  );
}; 