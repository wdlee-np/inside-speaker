"use client";

import { useInquiry } from "@/app/(public)/inquiry-context";
import { Icon } from "@/components/icon";

export function FooterInquiryButton() {
  const { openInquiry } = useInquiry();
  return (
    <button
      onClick={() => openInquiry()}
      style={{
        marginTop: 28,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 22px",
        fontSize: 13,
        fontWeight: 600,
        background: "var(--ink)",
        color: "#fff",
        border: "1px solid transparent",
      }}
    >
      <Icon name="arrow" size={14} /> 섭외 문의
    </button>
  );
}
