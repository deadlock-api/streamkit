import type { Theme } from "~/types/widget";

export type Match = {
  match_id: number;
  hero_id: number;
  match_result: number;
  player_team: number;
};

export type Hero = {
  id: number;
  images: {
    icon_hero_card_webp: string;
  };
};

export type MatchHistoryProps = {
  theme: Theme;
  accountId: string;
};
