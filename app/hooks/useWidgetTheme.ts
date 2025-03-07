import { useMemo } from "react";
import { THEME_STYLES } from "~/constants/widget";
import { cn } from "~/lib/utils";
import type { Theme } from "~/types/widget";

interface ThemeStyles {
  backgroundStyle: string;
  headerStyle: string;
  containerClasses: (showMatchHistory?: boolean) => string;
  headerClasses: (showMatchHistory?: boolean) => string;
  statClasses: string;
  brandingDividerClasses: string;
  brandingLinkClasses: string;
  brandingTextClasses: {
    primary: string;
    secondary: string;
  };
  userNameClasses: string;
}

export const useWidgetTheme = (theme: Theme, opacity = 100) => {
  const themeStyles = useMemo<ThemeStyles>(() => {
    const getBackgroundStyle = () => {
      if (theme === "glass") return "bg-black/10 backdrop-blur-md";

      if (theme === "light") {
        return cn("[background:rgba(255,255,255,var(--bg-opacity))]", "border-gray-100/5");
      }

      return cn("[background:rgba(26,27,30,var(--bg-opacity))]", "border-white/[0.03]");
    };

    const getHeaderStyle = () => {
      if (theme === "glass") return "bg-white/5";

      if (theme === "light") {
        return cn(
          "[background:linear-gradient(to_right,rgba(255,255,255,var(--bg-opacity)),rgba(249,250,251,var(--bg-opacity)))]",
          "border-b border-gray-900/5",
        );
      }

      return cn(
        "[background:linear-gradient(to_right,rgba(26,27,30,var(--bg-opacity)),rgba(37,38,43,var(--bg-opacity)))]",
        "border-b border-white/[0.03]",
      );
    };

    const getContainerClasses = (showMatchHistory?: boolean) => {
      return cn(
        "inline-flex flex-col",
        "rounded-b-xl",
        getBackgroundStyle(),
        theme !== "glass" && "border",
        showMatchHistory ? "border-t-0" : "rounded-t-xl",
        "shadow-lg",
        THEME_STYLES[theme].container,
      );
    };

    const getHeaderClasses = (showMatchHistory?: boolean) => {
      return cn(
        !showMatchHistory && "rounded-t-xl",
        "px-4 py-3",
        getHeaderStyle(),
        "relative",
        THEME_STYLES[theme].header,
      );
    };

    const getBrandingDividerClasses = () => {
      return cn(
        "h-px flex-1 bg-gradient-to-r from-transparent to-transparent",
        theme === "light" ? "via-gray-200/50" : theme === "glass" ? "via-white/10" : "via-white/5",
      );
    };

    const getBrandingLinkClasses = () => {
      return cn(
        "group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
        theme === "light"
          ? "bg-gray-100/50 hover:bg-gray-100"
          : theme === "glass"
            ? "bg-white/5 hover:bg-white/10"
            : "bg-white/[0.02] hover:bg-white/[0.04]",
      );
    };

    const getUserNameClasses = () => {
      return cn("text-[13px] font-medium tracking-wide", theme === "light" ? "text-gray-900" : "text-white/90");
    };

    return {
      backgroundStyle: getBackgroundStyle(),
      headerStyle: getHeaderStyle(),
      containerClasses: getContainerClasses,
      headerClasses: getHeaderClasses,
      statClasses: THEME_STYLES[theme].stat,
      brandingDividerClasses: getBrandingDividerClasses(),
      brandingLinkClasses: getBrandingLinkClasses(),
      brandingTextClasses: {
        primary: cn("text-[11px] font-medium transition-all", theme === "light" ? "text-gray-500" : "text-white/50"),
        secondary: cn(
          "text-[11px] font-semibold transition-all",
          theme === "light" ? "text-gray-600 group-hover:text-gray-900" : "text-white/70 group-hover:text-white",
        ),
      },
      userNameClasses: getUserNameClasses(),
    };
  }, [theme]);

  const cssVariables = useMemo(() => {
    return { "--bg-opacity": opacity / 100 } as React.CSSProperties;
  }, [opacity]);

  return {
    ...themeStyles,
    cssVariables,
  };
};
