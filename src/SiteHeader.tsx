interface Props {
  activePath: string;
  onNavigate: (path: string) => void;
}

const LINKS = [
  { path: "/", label: "总览", index: "00" },
  { path: "/界园", label: "界园", index: "01" },
  { path: "/萨卡兹", label: "萨卡兹", index: "02" },
];

export default function SiteHeader({ activePath, onNavigate }: Props) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          href="/"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
          }}
          aria-label="返回档案总览"
        >
          <span className="brand-mark" aria-hidden="true">
            <i className="mdi mdi-rhombus-split" />
          </span>
          <span className="brand-copy">
            <strong>集成战略档案</strong>
            <small>ROGUE ARCHIVE</small>
          </span>
        </a>

        <nav className="site-nav" aria-label="主导航">
          {LINKS.map((link) => (
            <a
              key={link.path}
              href={link.path}
              className={activePath === link.path ? "active" : ""}
              aria-current={activePath === link.path ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(link.path);
              }}
            >
              <span>{link.index}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
