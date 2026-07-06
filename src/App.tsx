import { useEffect, useMemo, useState } from "react";
import { pinyin } from "pinyin-pro";
import "@mdi/font/css/materialdesignicons.min.css";
import "./App.css";
import type { Bulletins, Collectible, Database } from "./types";
import BulletinBoard from "./BulletinBoard";

const RARITY_ORDER = ["低稀有度", "中稀有度", "高稀有度"];

// 特殊标识的简短展示名（完整含义见 marker_legend，作 tooltip）
const MARKER_SHORT: Record<string, string> = {
  "mdi-currency-usd-off": "非诡意行商",
  "mdi-heart-off-outline": "非易与",
  "mdi-sword": "险路恶敌",
  "mdi-close-circle": "不可交换",
  "mdi-transfer-up": "计数",
  "mdi-trophy-broken": "一次性",
  "mdi-numeric-1-box-outline": "DLC·1",
  "mdi-numeric-2-box-outline": "DLC·2",
  "mdi-chess-king": "国王",
  "mdi-crown": "魔王",
};

// 取名字的拼音首字母缩写，仅保留 a-z（如「铿金征鼓」→「kjzg」）
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

export default function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [bulletins, setBulletins] = useState<Bulletins | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seriesSel, setSeriesSel] = useState<Set<string>>(new Set());
  const [raritySel, setRaritySel] = useState<Set<string>>(new Set());
  const [markerSel, setMarkerSel] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/collectibles.json")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<Database>;
      })
      .then(setDb)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    fetch("/bulletins.json")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<Bulletins>;
      })
      .then(setBulletins)
      .catch(() => setBulletins(null)); // 公告非必需，失败静默
  }, []);

  const allSeries = useMemo(() => {
    if (!db) return [] as string[];
    const seen = new Set<string>();
    db.collectibles.forEach((c) => c.series && seen.add(c.series));
    return Array.from(seen);
  }, [db]);

  const allMarkers = useMemo(() => {
    if (!db) return [] as string[];
    const seen = new Set<string>();
    db.collectibles.forEach((c) => c.markers.forEach((m) => seen.add(m)));
    return Array.from(seen);
  }, [db]);

  // 预计算每个名字的拼音缩写，按 id 索引
  const abbrMap = useMemo(() => {
    const m = new Map<number, string>();
    if (!db) return m;
    db.collectibles.forEach((c) => m.set(c.id, nameToAbbr(c.name)));
    return m;
  }, [db]);

  const filtered = useMemo(() => {
    if (!db) return [] as Collectible[];
    const q = search.trim().toLowerCase();
    return db.collectibles.filter((c) => {
      if (seriesSel.size && !seriesSel.has(c.series || "")) return false;
      if (raritySel.size && !raritySel.has(c.rarity)) return false;
      if (markerSel.size && !c.markers.some((m) => markerSel.has(m))) return false;
      if (q) {
        const abbr = abbrMap.get(c.id) ?? "";
        const abbrHit = abbr !== "" && abbr === q;
        const strHit =
          c.name.toLowerCase().includes(q) ||
          c.effect.toLowerCase().includes(q);
        if (!abbrHit && !strHit) return false;
      }
      return true;
    });
  }, [db, seriesSel, raritySel, markerSel, search, abbrMap]);

  const clearAll = () => {
    setSeriesSel(new Set());
    setRaritySel(new Set());
    setMarkerSel(new Set());
    setSearch("");
  };

  if (error) return <div className="state">加载失败：{error}</div>;
  if (!db) return <div className="state">加载中…</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>界园藏品图鉴</h1>
        <p className="subtitle">
          共 {db.total} 件 · 筛选出 <strong>{filtered.length}</strong> 件
        </p>
      </header>

      {bulletins && bulletins.bulletins.length > 0 && (
        <BulletinBoard data={bulletins} />
      )}

      <aside className="filters">
        <FilterSection title="收藏品系列">
          {allSeries.map((s) => (
            <Chip
              key={s}
              active={seriesSel.has(s)}
              onClick={() => setSeriesSel((prev) => toggleInSet(prev, s))}
            >
              {s}
            </Chip>
          ))}
        </FilterSection>

        <FilterSection title="稀有度">
          {RARITY_ORDER.filter((r) => db.rarity_legend[r]).map((r) => (
            <Chip
              key={r}
              active={raritySel.has(r)}
              onClick={() => setRaritySel((prev) => toggleInSet(prev, r))}
              color={db.rarity_legend[r]?.color}
            >
              {r}
            </Chip>
          ))}
        </FilterSection>

        <FilterSection title="特殊标识">
          {allMarkers.map((m) => (
            <Chip
              key={m}
              active={markerSel.has(m)}
              onClick={() => setMarkerSel((prev) => toggleInSet(prev, m))}
              title={db.marker_legend[m] || m}
            >
              <i className={`mdi ${m}`} />
              <span>{MARKER_SHORT[m] ?? m.replace(/^mdi-/, "")}</span>
            </Chip>
          ))}
        </FilterSection>

        <button className="clear-btn" onClick={clearAll}>
          清除筛选
        </button>
      </aside>

      <main>
        <div className="search-bar">
          <i className="mdi mdi-magnify" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索名字 / 描述，或输入拼音缩写（如 kjzg）"
            spellCheck={false}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              title="清空搜索"
              aria-label="清空搜索"
            >
              <i className="mdi mdi-close" />
            </button>
          )}
        </div>

        <div className="grid">
          {filtered.length === 0 && (
            <div className="empty">没有匹配的收藏品</div>
          )}
          {filtered.map((c) => (
            <Card
              key={c.id}
              c={c}
              markerLegend={db.marker_legend}
              rarityColor={db.rarity_legend[c.rarity]?.color}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="filter-section">
      <h2>{title}</h2>
      <div className="chips">{children}</div>
    </div>
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
      className={"chip" + (active ? " active" : "")}
      onClick={onClick}
      title={title}
      style={color ? { ["--chip-color" as string]: color } : undefined}
    >
      {children}
    </button>
  );
}

function Card({
  c,
  markerLegend,
  rarityColor,
}: {
  c: Collectible;
  markerLegend: Record<string, string>;
  rarityColor?: string;
}) {
  return (
    <article
      className="card"
      style={rarityColor ? { ["--rarity" as string]: rarityColor } : undefined}
    >
      <div className="card-img">
        {c.image ? (
          <img src={`/images/${c.image}`} alt={c.name} loading="lazy" />
        ) : (
          <div className="no-img">无图</div>
        )}
      </div>
      <div className="card-body">
        <div className="card-head">
          <span className="card-no">No.{String(c.id).padStart(3, "0")}</span>
          <span className="card-rarity">{c.rarity}</span>
          {c.markers.length > 0 && (
            <span className="card-markers">
              {c.markers.map((m) => (
                <i key={m} className={`mdi ${m}`} title={markerLegend[m] || m} />
              ))}
            </span>
          )}
        </div>
        <h3 className="card-name">{c.name}</h3>
        {c.series && <div className="card-series">{c.series}</div>}
        <pre className="card-effect">{c.effect}</pre>
        {c.extraInfo.length > 0 && (
          <dl className="card-extra">
            {c.extraInfo.map((kv) => (
              <div className="extra-row" key={kv.key}>
                <dt>{kv.key}</dt>
                <dd>{kv.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
