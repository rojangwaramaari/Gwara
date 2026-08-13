"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [clock, setClock] = useState("12:00 PM");

  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(new Date());

      const hour = parts.find((p) => p.type === "hour")?.value ?? "12";
      const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
      const period = parts.find((p) => p.type === "dayPeriod")?.value ?? "AM";
      setClock(`${hour}:${minute} ${period}`);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const [hour, minutePeriod] = clock.split(":");
  const minute = minutePeriod?.slice(0, 2) ?? "00";
  const period = minutePeriod?.slice(2)?.trim() ?? "AM";

  return (
    <header className="fixed safe-top safe-left safe-right z-20 flex items-center justify-between text-[11px] tracking-[0.18em] text-white/70">
      <div className="tabular-nums">
        {hour}<span className="clock-colon">:</span>{minute} {period}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-white/45">NOW LISTENING</span>
        <span className="mx-2 text-white/20">•</span>
        <span>1,284 listeners</span>
      </div>

      <nav className="flex items-center gap-4">
        <a className="transition hover:text-white" href="https://www.youtube.com/" target="_blank" rel="noreferrer">YT</a>
        <a className="transition hover:text-white" href="https://www.instagram.com/" target="_blank" rel="noreferrer">IG</a>
      </nav>
    </header>
  );
}