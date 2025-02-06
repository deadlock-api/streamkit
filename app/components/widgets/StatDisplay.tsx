import type { FC } from "react";
import { THEME_STYLES } from "~/constants/widget";
import { cn } from "~/lib/utils";
import type { StatDisplayProps } from "~/types/widget";

export const StatDisplay: FC<StatDisplayProps> = ({ stat, theme = "default", className }) => {
  const { variable, label, value, prefix, suffix } = stat;

  return (
    <div
      className={cn(
        "flex flex-col items-center p-2.5 rounded-lg transition-all duration-200",
        theme === "light"
          ? "bg-gradient-to-br from-gray-50 to-white border-gray-200/50"
          : theme === "glass"
            ? "bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/[0.05]"
            : "bg-gradient-to-br from-[#25262B] to-[#2C2E33] border-white/[0.03]",
        theme === "light" && "border",
        "relative",
        "min-w-fit",
        THEME_STYLES[theme].stat,
        className,
      )}
    >
      {variable.endsWith("_img") ? (
        <img src={value as string} alt={label} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <>
          <span
            className={cn(
              "text-[11px] font-medium tracking-wide uppercase text-center",
              theme === "light" ? "text-gray-500" : "text-white/60",
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
