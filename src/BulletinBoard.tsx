import { useEffect, useState } from "react";
import type { Bulletins } from "./types";

interface Props {
  data: Bulletins;
}

/**
 * 公告轮播：从 JSON 读取多条 HTML 公告，按 interval 轮换。
 * 鼠标悬停时暂停，可手动前后切换或跳转。
 */
export default function BulletinBoard({ data }: Props) {
  const items = data.bulletins;
  const defaultInterval = data.interval ?? 5000;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // 列表变化时回到第一条，避免越界
  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  const duration = items[index]?.duration ?? defaultInterval;

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
    }, duration);
    return () => clearTimeout(t);
  }, [index, paused, items.length, duration]);

  if (items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];
  const multi = items.length > 1;

  return (
    <div
      className="bulletin"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="status"
      aria-live="polite"
    >
      <i className="mdi mdi-bullhorn-variant-outline bulletin-icon" />

      <div
        className="bulletin-content"
        key={current.id}
        dangerouslySetInnerHTML={{ __html: current.content }}
      />

      {multi && (
        <>
          <button
            className="bulletin-nav"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
            title="上一条"
            aria-label="上一条公告"
          >
            <i className="mdi mdi-chevron-left" />
          </button>

          <div className="bulletin-dots">
            {items.map((b, i) => (
              <button
                key={b.id}
                className={"dot" + (i === index ? " active" : "")}
                onClick={() => setIndex(i)}
                aria-label={`第 ${i + 1} 条`}
              />
            ))}
          </div>

          <button
            className="bulletin-nav"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            title="下一条"
            aria-label="下一条公告"
          >
            <i className="mdi mdi-chevron-right" />
          </button>
        </>
      )}
    </div>
  );
}
