"use client";

import { useState, useEffect } from "react";
import { useInquiry } from "@/app/(public)/inquiry-context";
import { Icon } from "@/components/icon";

export function FloatingInquiry() {
  const [visible, setVisible] = useState(false);
  const { openInquiry } = useInquiry();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => openInquiry()}
      aria-label="섭외 문의하기"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 55,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px 14px 14px",
        background: "var(--ink)",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(20,19,17,0.25)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(.95)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "transform 280ms cubic-bezier(.2,.8,.2,1), opacity 280ms ease",
        border: "none",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "var(--accent)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name="chat" size={14} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>섭외 문의</span>
    </button>
  );
}
