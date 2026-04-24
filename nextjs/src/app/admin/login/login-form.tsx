"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-en)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.12em",
              color: "var(--color-ink)",
            }}
          >
            INSIDE SPEAKERS
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--color-ink-muted)",
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            Admin
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-ink-soft)",
                marginBottom: 6,
              }}
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--color-line-strong)",
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="admin@insidecompany.co.kr"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-ink-soft)",
                marginBottom: 6,
              }}
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--color-line-strong)",
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "var(--color-semantic-error)", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: 8, justifyContent: "center", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              "로그인 중..."
            ) : (
              <>
                <Icon name="arrowRt" size={14} />
                로그인
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
