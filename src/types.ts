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
  price?: string | null;
  effect: string;
  description?: string;
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

export interface Bulletin {
  id: string;
  /** HTML 字符串，将原样渲染（请确保来源可信） */
  content: string;
  /** 该条公告的展示时长，缺省取 Bulletins.interval */
  duration?: number;
}

export interface Bulletins {
  /** 默认轮换间隔（毫秒） */
  interval?: number;
  bulletins: Bulletin[];
}
