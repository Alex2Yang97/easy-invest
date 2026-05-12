"use client";

import { useState } from "react";

export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function onClick() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: "我的定投回测 / My DCA backtest" });
        return;
      }
    } catch {
      // user cancelled — fall through to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      window.prompt("复制链接 / Copy link", url);
    }
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-[13px] font-medium hover:border-foreground/40 transition"
    >
      {state === "copied" ? (
        <>
          <span>✓</span>
          <span>已复制 / Copied</span>
        </>
      ) : (
        <>
          <ShareIcon />
          <span>分享链接 / Share</span>
        </>
      )}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
