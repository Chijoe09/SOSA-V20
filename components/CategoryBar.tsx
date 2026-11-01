"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShop } from "@/lib/shop";

const GREEN = "#22c55e", WHITE = "#FFFFFF";

/** Lives inside the dark header. Pointers show how many category chips are hidden left (-n) / right (+n). */
export default function CategoryBar() {
  const { categories, category, setCategory } = useShop();
  const ref = useRef<HTMLDivElement>(null);
  const [hid, setHid] = useState({ l: 0, r: 0 });

  const measure = useCallback(() => {
    const el = ref.current; if (!el) return;
    const box = el.getBoundingClientRect(); let l = 0, r = 0;
    Array.from(el.children).forEach(c => {
      const b = c.getBoundingClientRect();
      if (b.right <= box.left + 1) l++; else if (b.left >= box.right - 1) r++;
    });
    setHid({ l, r });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    el?.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { el?.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); };
  }, [measure, categories]);

  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const chip = (active: boolean) => `shrink-0 px-3 py-1 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-white/30 text-white"}`;

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <button onClick={() => go(-1)} disabled={hid.l === 0} className="shrink-0 text-sm font-bold disabled:opacity-40" aria-label="Scroll categories left">
        <span style={{ color: GREEN }}>&lt;&lt;</span> <span style={{ color: WHITE }}>-{hid.l}</span>
      </button>
      <div ref={ref} className="flex-1 flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button className={chip(category === null)} onClick={() => setCategory(null)}>All</button>
        {categories.map(c => <button key={c} className={chip(category === c)} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      <button onClick={() => go(1)} disabled={hid.r === 0} className="shrink-0 text-sm font-bold disabled:opacity-40" aria-label="Scroll categories right">
        <span style={{ color: WHITE }}>+{hid.r}</span> <span style={{ color: GREEN }}>&gt;&gt;</span>
      </button>
    </div>
  );
}
