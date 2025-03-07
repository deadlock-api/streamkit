import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { StatDisplayProps } from "./StatDisplay.types";
import { StatImage } from "./StatImage";
import { StatText } from "./StatText";

/**
 * Component for displaying a single statistic with various formatting options
 */
export const StatDisplay: FC<StatDisplayProps> = ({ stat, theme = "dark", className }) => {
  const { variable, label, value, prefix, suffix, opacity = 100 } = stat;
  const isImageStat = variable.endsWith("_img");

  return (
    <div
      style={{ "--bg-opacity": opacity / 100 } as React.CSSProperties}
      className={
        !isImageStat
          ? cn(
              "flex flex-col items-center p-2.5 rounded-lg",
              theme === "light"
                ? "[background:rgba(240,240,240,var(--bg-opacity))]"
                : theme === "glass"
                  ? "bg-white/5 hover:bg-white/10 backdrop-blur border border-white/[0.05]"
                  : "[background:rgba(38,39,43,var(--bg-opacity))] border-white/[0.03]",
              "relative min-w-fit",
              className,
            )
          : cn("flex flex-col items-center p-2.5 rounded-lg")
      }
    >
      {isImageStat && value ? (
        <StatImage value={value as string} label={label} />
      ) : (
        <StatText label={label} value={value} prefix={prefix} suffix={suffix} theme={theme} />
      )}
    </div>
  );
};
