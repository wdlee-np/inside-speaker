"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icon";

const navItems = [
  { href: "/admin/speakers", label: "연사 관리", icon: "user" as const },
  { href: "/admin/categories", label: "카테고리", icon: "grid" as const },
  { href: "/admin/inquiries", label: "섭외 문의", icon: "mail" as const },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-line)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid var(--color-line)",
          }}
        >
          <Link href="/" target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontFamily: "var(--font-en)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.12em",
                color: "var(--color-ink)",
              }}
            >
              INSIDE SPEAKERS
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-ink-muted)",
                marginTop: 2,
                textTransform: "uppercase",
              }}
            >
              Admin Console
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--color-accent)" : "var(--color-ink-soft)",
                  background: active ? "var(--color-accent-soft)" : "transparent",
                  borderRadius: 6,
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "background 150ms ease, color 150ms ease",
                }}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--color-line)" }}>
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--color-ink-muted)",
              textDecoration: "none",
              borderRadius: 6,
              marginBottom: 2,
            }}
          >
            <Icon name="chevRt" size={14} />
            사이트 보기
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--color-ink-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
              textAlign: "left",
            }}
          >
            <Icon name="x" size={14} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 220, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
