import Link from "next/link";
import type { CategoryWithSubs } from "@/lib/database.types";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";
import { FooterInquiryButton } from "@/components/footer-inquiry-button";

interface FooterProps {
  categories: CategoryWithSubs[];
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer style={{ marginTop: 120, borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
      <div className="wrap" style={{ padding: "64px 48px 36px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 48 }}
          className="footer-grid"
        >
          <div>
            <Logo />
            <p
              className="serif"
              style={{ marginTop: 22, fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.015em", maxWidth: 380 }}
            >
              한 시간의 강연이
              <br />
              조직의 10년을 바꿉니다.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <Link
                href="/register"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 22px", fontSize: 13, fontWeight: 600,
                  background: "transparent", color: "var(--ink)",
                  border: "1px solid var(--ink)", textDecoration: "none",
                }}
              >
                <Icon name="plus" size={14} /> 강사 등록
              </Link>
              <FooterInquiryButton />
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>Directory</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.id}`} style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>Company</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["About Inside", "Press", "Partnerships", "Careers"].map((it) => (
                <li key={it}>
                  <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{it}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>Contact</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "경기도 성남시 수정구 창업로 43",
                "판교글로벌비즈센터 B동 1011호",
                "E-mail: contact@insidecompany.co.kr",
                "Tel. 02-6925-5032",
              ].map((it) => (
                <li key={it}>
                  <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: 72,
            paddingTop: 24,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--ink-muted)",
            letterSpacing: "0.04em",
          }}
          className="footer-base"
        >
          <span className="en">© 2026 INSIDE COMPANY · JUST 강사</span>
          <span className="en">ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
}
