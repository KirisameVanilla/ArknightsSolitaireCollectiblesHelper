import { useEffect, useState } from "react";
import "@mdi/font/css/materialdesignicons.min.css";
import "./App.css";
import AtlasPage from "./AtlasPage";
import HomePage from "./HomePage";
import SiteHeader from "./SiteHeader";

function currentPath(): string {
  const decoded = decodeURIComponent(window.location.pathname);
  return decoded.length > 1 ? decoded.replace(/\/+$/, "") : "/";
}

export default function App() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const syncPath = () => setPath(currentPath());
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  const navigate = (nextPath: string) => {
    if (nextPath === path) return;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let page: React.ReactNode;
  if (path === "/") {
    page = <HomePage onNavigate={navigate} />;
  } else if (path === "/界园") {
    page = (
      <AtlasPage
        key="jieyuan"
        config={{
          title: "界园藏品图鉴",
          kicker: "岁的界园志异",
          description: "珍玩入册，万象归档。检索流转于界园之中的奇物与旧梦。",
          dataUrl: "/rogue_5/collectibles.json",
          imageBase: "/rogue_5/images",
          theme: "jieyuan",
          showBulletins: true,
        }}
      />
    );
  } else if (path === "/萨卡兹") {
    page = (
      <AtlasPage
        key="sarkaz"
        config={{
          title: "想象实体图鉴",
          kicker: "萨卡兹的无终奇语",
          description: "在虚实疆界中，为思绪赋形。收录全部想象实体、效果与取得记录。",
          dataUrl: "/rogue_4/collectibles.json",
          imageBase: "/rogue_4/images",
          theme: "sarkaz",
        }}
      />
    );
  } else {
    page = (
      <main className="not-found">
        <span>404 / ARCHIVE VOID</span>
        <h1>此页尚未归档</h1>
        <button onClick={() => navigate("/")}>返回档案索引</button>
      </main>
    );
  }

  return (
    <div className="site-shell">
      <SiteHeader activePath={path} onNavigate={navigate} />
      {page}
    </div>
  );
}
