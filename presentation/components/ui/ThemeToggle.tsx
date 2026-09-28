"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark",
  );

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button onClick={toggle} className="theme-toggle" aria-label="Đổi giao diện sáng/tối" suppressHydrationWarning>
      {dark ? "☀️ Sáng" : "🌙 Tối"}
    </button>
  );
}
