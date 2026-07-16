import { useEffect, useMemo, useState } from "react";
import { pinyin } from "pinyin-pro";
import type { Bulletins, Collectible, Database } from "./types";
import BulletinBoard from "./BulletinBoard";

const RARITY_ORDER = ["低稀有度", "中稀有度", "高稀有度"];

const MARKER_SHORT: Record<string, string> = {
  "mdi-currency-usd-off": "非诡意行商",
  "mdi-heart-off-outline": "非易与",
  "mdi-sword": "险路恶敌",
  "mdi-close-circle": "不可交换",
  "mdi-transfer-up": "可叠加",
  "mdi-trophy-broken": "一次性",
  "mdi-numeric-1-box-outline": "内容拓展·I",
  "mdi-numeric-2-box-outline": "内容拓展·II",
  "mdi-chess-king": "国王藏品",
  "mdi-crown": "魔王藏品",
  "mdi-treasure-chest-outline": "高级奖励",
  "mdi-diamond-stone": "稀有奖励",
  "mdi-gift-outline": "寻常奖励",
  "mdi-lightbulb-on-outline": "灵光乍现",
  "mdi-store-clock-outline": "行商刷新",
  "mdi-eye": "诡谲断章",
  "mdi-music-note": "终曲合声",
};

export interface AtlasConfig {
  title: string;
  kicker: string;
  description: string;
  dataUrl: string;
  imageBase: string;
  theme: "jieyuan" | "sarkaz";
  showBulletins?: boolean;
}

function nameToAbbr(name: string): string {
  return pinyin(name, { pattern: "first", toneType: "none" })
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
}

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function AtlasPage({ config }: { config: AtlasConfig }) {
  const [db, setDb] = useState<Database | null>(null);
  const [bulletins, setBulletins] = useState<Bulletins | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seriesSel, setSeriesSel] = useState<Set<string>>(new Set());
  const [raritySel, setRaritySel] = useState<Set<string>>(new Set());
  const [markerSel, setMarkerSel] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    setDb(null);
    setError(null);
    fetch(config.dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Database>;
      })
      .then(setDb)
      .catch((reason) => setError(String(reason)));
  }, [config.dataUrl]);

  useEffect(() => {
    if (!config.showBulletins) return;
    fetch("/bulletins.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Bulletins>;
      })
      .then(setBulletins)
      .catch(() => setBulletins(null));
  }, [config.showBulletins]);

  const allSeries = useMemo(() => {
    const seen = new Set<string>();
    db?.collectibles.forEach((item) => item.series && seen.add(item.series));
    return Array.from(seen);
  }, [db]);

  const allMarkers = useMemo(() => {
    const seen = new Set<string>();
    db?.collectibles.forEach((item) => item.markers.forEach((marker) => seen.add(marker)));
    return Array.from(seen);
  }, [db]);

  const abbrMap = useMemo(() => {
    const abbreviations = new Map<number, string>();
    db?.collectibles.forEach((item) => abbreviations.set(item.id, nameToAbbr(item.name)));
    return abbreviations;
  }, [db]);

  const filtered = useMemo(() => {
    if (!db) return [] as Collectible[];
    const query = search.trim().toLowerCase();
    return db.collectibles.filter((item) => {
      if (seriesSel.size && !seriesSel.has(item.series || "")) return false;
      if (raritySel.size && !raritySel.has(item.rarity)) return false;
      if (markerSel.size && !item.markers.some((marker) => markerSel.has(marker))) return false;
      if (!query) return true;

      const extraText = item.extraInfo.map(({ key, value }) => `${key} ${value}`).join(" ");
      const searchable = [item.name, item.effect, item.description || "", extraText]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query) || (abbrMap.get(item.id) || "").includes(query);
    });
  }, [abbrMap, db, markerSel, raritySel, search, seriesSel]);

  const clearAll = () => {
    setSeriesSel(new Set());
    setRaritySel(new Set());
    setMarkerSel(new Set());
    setSearch("");
  };

  const activeFilterCount = seriesSel.size + raritySel.size + markerSel.size + (search ? 1 : 0);

  if (error) {
    return (
      <main className={`atlas ${config.theme}`}>
        <div className="state">
          <i className="mdi mdi-alert-outline" />
          <strong>档案载入失败</strong>
          <span>{error}</span>
        </div>
      </main>
    );
  }
  if (!db) {
    return (
      <main className={`atlas ${config.theme}`}>
        <div className="state loading">
          <i className="mdi mdi-loading mdi-spin" />
          <span>正在调取档案…</span>
        </div>
      </main>
    );
  }

  const hasRarity = Object.keys(db.rarity_legend).length > 0;

  return (
    <main className={`atlas ${config.theme}`}>
      <section className="atlas-masthead">
        <div className="atlas-title">
          <p>{config.kicker}</p>
          <h1>{config.title}</h1>
          <span>{config.description}</span>
        </div>
        <div className="atlas-stat" aria-label={`共收录 ${db.total} 件`}>
          <strong>{String(db.total).padStart(3, "0")}</strong>
          <span>ARCHIVED<br />ENTITIES</span>
        </div>
      </section>

      <div className="atlas-layout">
        {config.showBulletins && bulletins && bulletins.bulletins.length > 0 && (
          <BulletinBoard data={bulletins} />
        )}

        <aside className="filters">
          <div className="filter-heading">
            <span>FILTER / 筛选</span>
            {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
          </div>

          <FilterSection title="收藏系列" icon="mdi-shape-outline">
            {allSeries.map((series) => (
              <Chip
                key={series}
                active={seriesSel.has(series)}
                onClick={() => setSeriesSel((previous) => toggleInSet(previous, series))}
              >
                {series}
              </Chip>
            ))}
          </FilterSection>

          {hasRarity && (
            <FilterSection title="稀有度" icon="mdi-star-four-points-outline">
              {RARITY_ORDER.filter((rarity) => db.rarity_legend[rarity]).map((rarity) => (
                <Chip
                  key={rarity}
                  active={raritySel.has(rarity)}
                  onClick={() => setRaritySel((previous) => toggleInSet(previous, rarity))}
                  color={db.rarity_legend[rarity]?.color}
                >
                  {rarity}
                </Chip>
              ))}
            </FilterSection>
          )}

          <FilterSection title="特殊标识" icon="mdi-tag-multiple-outline">
            {allMarkers.map((marker) => (
              <Chip
                key={marker}
                active={markerSel.has(marker)}
                onClick={() => setMarkerSel((previous) => toggleInSet(previous, marker))}
                title={db.marker_legend[marker] || marker}
              >
                <i className={`mdi ${marker}`} />
                <span>{MARKER_SHORT[marker] ?? db.marker_legend[marker] ?? marker.replace(/^mdi-/, "")}</span>
              </Chip>
            ))}
          </FilterSection>

          <button className="clear-btn" onClick={clearAll} disabled={activeFilterCount === 0}>
            <i className="mdi mdi-filter-remove-outline" />
            清除全部筛选
          </button>
        </aside>

        <section className="atlas-results">
          <div className="result-tools">
            <label className="search-bar">
              <i className="mdi mdi-magnify" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索名称、效果、获取方式或拼音缩写"
                spellCheck={false}
              />
              {search && (
                <button onClick={() => setSearch("")} title="清空搜索" aria-label="清空搜索">
                  <i className="mdi mdi-close" />
                </button>
              )}
            </label>
            <div className="result-count">
              <span>RESULT</span>
              <strong>{filtered.length}</strong>
              <span>/ {db.total}</span>
            </div>
          </div>

          <div className="grid">
            {filtered.length === 0 && (
              <div className="empty">
                <i className="mdi mdi-archive-search-outline" />
                <strong>未发现匹配记录</strong>
                <button onClick={clearAll}>重置检索条件</button>
              </div>
            )}
            {filtered.map((item, index) => (
              <Card
                key={item.id}
                collectible={item}
                imageBase={config.imageBase}
                markerLegend={db.marker_legend}
                rarityColor={db.rarity_legend[item.rarity]?.color}
                index={index}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="filter-section">
      <h2><i className={`mdi ${icon}`} />{title}</h2>
      <div className="chips">{children}</div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
  title,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  color?: string;
}) {
  return (
    <button
      className={`chip${active ? " active" : ""}`}
      onClick={onClick}
      title={title}
      aria-pressed={active}
      style={color ? { ["--chip-color" as string]: color } : undefined}
    >
      {children}
    </button>
  );
}

function Card({
  collectible,
  imageBase,
  markerLegend,
  rarityColor,
  index,
}: {
  collectible: Collectible;
  imageBase: string;
  markerLegend: Record<string, string>;
  rarityColor?: string;
  index: number;
}) {
  return (
    <article
      className="card"
      style={{
        ...(rarityColor ? { ["--rarity" as string]: rarityColor } : {}),
        ["--delay" as string]: `${Math.min(index, 18) * 22}ms`,
      }}
    >
      <div className="card-img">
        <span className="card-number">NO.{String(collectible.id).padStart(3, "0")}</span>
        {collectible.image ? (
          <img src={`${imageBase}/${collectible.image}`} alt={collectible.name} loading="lazy" />
        ) : (
          <i className="mdi mdi-image-off-outline no-img" aria-label="无图" />
        )}
        {collectible.price && (
          <span className="card-price" title="售价">
            <i className="mdi mdi-hexagon-multiple-outline" />{collectible.price}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta">
          {collectible.series && <span className="card-series">{collectible.series}</span>}
          {collectible.rarity && (
            <span className="card-rarity">{collectible.rarity}</span>
          )}
          {collectible.markers.length > 0 && (
            <span className="card-markers">
              {collectible.markers.map((marker) => (
                <i key={marker} className={`mdi ${marker}`} title={markerLegend[marker] || marker} />
              ))}
            </span>
          )}
        </div>
        <h3>{collectible.name}</h3>
        <div className="card-effect">{collectible.effect}</div>
        {collectible.description && <p className="card-description">{collectible.description}</p>}
        {collectible.extraInfo.length > 0 && (
          <dl className="card-extra">
            {collectible.extraInfo.map(({ key, value }, itemIndex) => (
              <div className="extra-row" key={`${key}-${itemIndex}`}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
