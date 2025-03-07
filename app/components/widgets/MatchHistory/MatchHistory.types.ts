import type { Theme } from "~/types/widget";

/**
 * Represents a single match in the match history
 */
export interface Match {
  /** Unique identifier for the match */
  match_id: number;
  /** ID of the hero used in the match */
  hero_id: number;
  /** Result of the match (win/loss) */
  match_result: number;
  /** Team the player was on */
  player_team: number;
}

/**
 * Hero data structure
 */
export interface Hero {
  /** Unique identifier for the hero */
  id: number;
  /** Collection of image URLs for the hero */
  images: {
    /** WebP format image URL for the hero card icon */
    icon_hero_card_webp: string;
  };
}

/**
 * Component props for the MatchHistory component
 */
export interface MatchHistoryProps {
  /** Visual theme to apply */
  theme: Theme;
  /** Number of matches to display */
  numMatches?: number;
  /** Account ID for fetching match history */
  accountId: string;
  /** Refresh trigger - increment to force refresh */
  refresh?: number;
  /** Opacity value (0-100) */
  opacity?: number;
}

/**
 * Hook return type for useMatchHistory
 */
export interface UseMatchHistoryResult {
  /** List of matches to display */
  matches: Match[];
  /** Map of hero IDs to image URLs */
  heroes: Map<number, string>;
  /** Whether data is currently loading */
  loading: boolean;
}
