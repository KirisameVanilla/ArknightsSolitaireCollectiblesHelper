export interface KVPair {
  key: string;
  value: string;
}

export interface Collectible {
  id: number;
  name: string;
  image: string | null;
  series: string | null;
  rarity: string;
  markers: string[];
  effect: string;
  extraInfo: KVPair[];
}

export interface Database {
  source: string;
  total: number;
  rarity_legend: Record<string, { color: string }>;
  marker_legend: Record<string, string>;
  validation: Record<string, unknown>;
  collectibles: Collectible[];
}
