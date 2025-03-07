import type { Theme } from "~/types/widget";

/**
 * Props for the StatText component
 */
export interface StatTextProps {
  /** Display label for the stat */
  label: string;
  /** Display value for the stat */
  value: string | number | null;
  /** Optional prefix text to display before the value */
  prefix?: string;
  /** Optional suffix text to display after the value */
  suffix?: string;
  /** Visual theme to apply */
  theme: Theme;
}
