interface Props {
  onNavigate: (path: string) => void;
}

const ARCHIVES = [
  {
    path: "/界园",
    index: "01",
    title: "界园",
    subtitle: "岁的界园志异",
    count: "294",
    unit: "件珍玩",
    className: "jieyuan",
  },
  {
    path: "/萨卡兹",
    index: "02",
    title: "萨卡兹",
    subtitle: "无终奇语 · 想象实体",
    count: "296",
    unit: "件实体",
    className: "sarkaz",
  },
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <main className="home">
      <section className="home-hero">
        <div className="hero-index">R.I.</div>
        <div className="hero-copy">
          <p className="eyebrow">RHODES ISLAND · INTEGRATED STRATEGIES</p>
          <h1>
            漫游者的
            <br />
            <em>藏品档案</em>
          </h1>
          <p className="hero-lead">
            两段旅途，两种现实。检索藏品、效果、来源与那些在叙事边缘留下的只言片语。
          </p>
        </div>
        <div className="hero-seal" aria-hidden="true">
          <i className="mdi mdi-compass-rose" />
          <span>IS · 04</span>
        </div>
      </section>

      <section className="archive-list" aria-label="可用图鉴">
        <header className="section-title">
          <span>AVAILABLE ARCHIVES</span>
          <span>共 {ARCHIVES.length} 卷</span>
        </header>
        {ARCHIVES.map((archive) => (
          <a
            key={archive.path}
            href={archive.path}
            className={`archive-entry ${archive.className}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(archive.path);
            }}
          >
            <span className="archive-index">{archive.index}</span>
            <span className="archive-name">
              <small>{archive.subtitle}</small>
              <strong>{archive.title}</strong>
            </span>
            <span className="archive-count">
              <strong>{archive.count}</strong>
              <small>{archive.unit}</small>
            </span>
            <span className="archive-arrow" aria-hidden="true">
              <i className="mdi mdi-arrow-top-right" />
            </span>
          </a>
        ))}
      </section>

      <footer className="home-footer">
        <span>DATA SOURCE · PRTS WIKI</span>
        <span>LOCAL ARCHIVE / 2026</span>
      </footer>
    </main>
  );
}
