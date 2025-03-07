import type { Match } from "../MatchHistory.types";

/**
 * Props for the MatchItem component
 */
export interface MatchItemProps {
  /** Match data to display */
  match: Match;
  /** URL of the hero image to display */
  heroImage: string;
}
