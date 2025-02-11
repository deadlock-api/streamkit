export type StatValue = string | number | null;

export type Stat = {
  variable: string;
  value: StatValue;
  label: string;
  icon?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
};

export type Theme = "dark" | "glass" | "light";

export type Region = "Europe" | "Asia" | "NAmerica" | "SAmerica" | "Oceania";

export type BoxWidgetProps = {
  region: Region;
  accountId: string;
  variables?: string[];
  labels?: string[];
  extraArgs?: Record<string, string>;
  theme?: Theme;
  showHeader?: boolean;
  refreshInterval?: number;
  showBranding?: boolean;
  showMatchHistory?: boolean;
  matchHistoryShowsToday?: boolean;
  numMatches?: number;
};

export type StatDisplayProps = {
  stat: Stat;
  className?: string;
  theme?: Theme;
};
