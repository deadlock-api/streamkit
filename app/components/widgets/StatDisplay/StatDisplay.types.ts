import type { Theme } from "~/types/widget";

/**
 * Represents a single statistic to be displayed
 */
export interface Stat {
  /** Variable name for the stat */
  variable: string;
  /** Display value for the stat */
  value: string | number | null;
  /** Display label for the stat */
  label: string;
  /** Optional icon to display with the stat */
  icon?: string;
  /** Optional color for the stat */
  color?: string;
  /** Optional prefix text to display before the value */
  prefix?: string;
  /** Optional suffix text to display after the value */
  suffix?: string;
  /** Opacity value (0-100) */
  opacity?: number;
}

/**
 * Props for the StatDisplay component
 */
export interface StatDisplayProps {
  /** Stat data to display */
  stat: Stat;
  /** Visual theme to apply */
  theme?: Theme;
  /** Additional CSS classes to apply */
  className?: string;
}
