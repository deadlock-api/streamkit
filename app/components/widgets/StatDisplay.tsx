import type { FC } from "react";
import { THEME_STYLES } from "~/constants/widget";
import { cn } from "~/lib/utils";
import type { StatDisplayProps } from "~/types/widget";

export const StatDisplay: FC<StatDisplayProps> = ({ stat, theme = "dark", className }) => {
  const { variable, label, value, prefix, suffix, opacity = 100 } = stat;

  return (
    <div
      style={{ "--bg-opacity": opacity / 100 } as React.CSSProperties}
      className={
        !variable.endsWith("_img")
          ? cn(
              "flex flex-col items-center p-2.5 rounded-lg",
              theme === "light"
                ? "[background:rgba(240,240,240,var(--bg-opacity))]"
                : theme === "glass"
                  ? "bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/[0.05]"
                  : "[background:rgba(38,39,43,var(--bg-opacity))] border-white/[0.03]",
              "relative min-w-fit",
              className,
            )
          : cn("flex flex-col items-center p-2.5 rounded-lg")
      }
    >
      {variable.endsWith("_img") && value ? (
        <img src={value as string} alt={label} className="w-16" />
      ) : (
        <>
          <span
            className={cn(
              "text-[11px] font-medium tracking-wide uppercase text-center",
              theme === "light" ? "text-gray-800" : "text-white/60",
            )}
          >
            {label}
          </span>
          <div className={cn("mt-0.5 flex items-baseline justify-center gap-1")}>
            {prefix && (
              <span className={cn("text-xs font-medium", theme === "light" ? "text-gray-500" : "text-white/60")}>
                {prefix}
              </span>
            )}
            <span className={cn("font-bold tracking-tight", theme === "light" ? "text-gray-900" : "text-white")}>
              {value ?? "-"}
            </span>
            {suffix && (
              <span className={cn("text-xs font-medium", theme === "light" ? "text-gray-500" : "text-white/60")}>
                {suffix}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
