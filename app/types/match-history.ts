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
  theme: string;
  opacity: number;
  numMatches?: number;
  accountId: string;
  refresh: number;
};
