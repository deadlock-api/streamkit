import { Theme } from "~/types/widget";

/**
 * Props for the BoxHeader component
 */
export interface BoxHeaderProps {
  /** Username to display in the header */
  userName?: string;
  /** Whether to show match history */
  showMatchHistory?: boolean;
  /** Theme-related class names */
  themeClasses: {
    /** Classes for the header container */
    headerClasses: (showMatchHistory?: boolean) => string;
    /** Classes for the username text */
    userNameClasses: string;
  };
}
