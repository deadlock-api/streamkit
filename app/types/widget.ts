import type { ReactNode } from "react";

export type StatValue = string | number | null;

export type Stat = {
  value: StatValue;
  label: string;
  icon?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
};

export type Theme = "default" | "dark" | "glass" | "light";

export type WidgetSize = "sm" | "md" | "lg";

export type BoxWidgetProps = {
  region: string;
  accountId: string;
  variables?: string[];
  labels?: string[];
  extraArgs?: Record<string, string>;
  theme?: Theme;
  size?: WidgetSize;
  showHeader?: boolean;
  customHeader?: ReactNode;
  className?: string;
  statClassName?: string;
  loading?: boolean;
  error?: string | null;
  refreshInterval?: number;
  showBranding?: boolean;
  showMatchHistory?: boolean;
};

export type StatDisplayProps = {
  stat: Stat;
  size?: WidgetSize;
  className?: string;
  theme?: Theme;
};
