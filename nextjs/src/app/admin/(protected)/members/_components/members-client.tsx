"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createAdminMember,
  updateAdminMember,
  disableAdminMember,
  enableAdminMember,
  deleteAdminMember,
  type AdminMember,
} from "@/app/admin/_actions/members";
import { Icon } from "@/components/icon";

interface Props {
  members: AdminMember[];
  currentUserId: string | null;
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 13,
  border: "1px solid var(--color-line)",
  borderRadius: 6,
  background: "var(--color-bg)",
  color: "var(--color-ink)",
  outline: "none",
};

function Btn({
  variant,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "ghost" | "danger";
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 6,
    border: "none",
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.5 : 1,
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-accent)", color: "#fff" },
    ghost: {
      background: "transparent",
      color: "var(--color-ink-soft)",
      border: "1px solid var(--color-line)",
    },
    danger: {
      background: "transparent",
      color: "#ef4444",
      border: "1px solid #fca5a5",
    },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
}

export function MembersClient({ members, currentUserId }: Props) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addDisplayName, setAddDisplayName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    const result = await createAdminMember(addEmail, addPassword, addDisplayName);
    setLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("관리자 계정이 생성되었습니다.");
      setShowAddForm(false);
      setAddEmail("");
      setAddPassword("");
      setAddDisplayName("");
      router.refresh();
    }
  }

  async function handleUpdate(id: string) {
    setLoading(id);
    const result = await updateAdminMember(id, editDisplayName);
    setLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("수정되었습니다.");
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDisable(id: string) {
    if (!confirm("이 계정을 비활성화하시겠습니까?")) return;
    setLoading(id);
    const result = await disableAdminMember(id, currentUserId ?? "");
    setLoading(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("비활성화되었습니다.");
      router.refresh();
    }
  }

  async function handleEnable(id: string) {
    setLoading(id);
    const result = await enableAdminMember(id);
    setLoading(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("활성화되었습니다.");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 계정을 완전히 삭제하시겠습니까?\n로그인 권한만 제거되며 Supabase Auth 계정은 유지됩니다."))
      return;
    setLoading(id);
    const result = await deleteAdminMember(id, currentUserId ?? "");
    setLoading(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("삭제되었습니다.");
      router.refresh();
    }
  }

  return (
    <div>
      {/* 추가 버튼 */}
      <div style={{ marginBottom: 24 }}>
        <Btn variant="primary" onClick={() => setShowAddForm((p) => !p)}>
          <Icon name="plus" size={13} />
          관리자 추가
        </Btn>
      </div>

      {/* 등록 폼 */}
      {showAddForm && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            maxWidth: 480,
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--color-ink)",
            }}
          >
            새 관리자 등록
          </h3>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                이메일 *
              </label>
              <input
                type="email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                비밀번호 * (8자 이상)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                표시 이름
              </label>
              <input
                type="text"
                value={addDisplayName}
                onChange={(e) => setAddDisplayName(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                placeholder="홍길동"
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn type="submit" variant="primary" disabled={loading === "create"}>
                {loading === "create" ? "등록 중…" : "등록"}
              </Btn>
              <Btn type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                취소
              </Btn>
            </div>
          </form>
        </div>
      )}

      {/* 회원 목록 */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-line)",
                background: "var(--color-bg)",
              }}
            >
              {["로그인 ID (이메일)", "표시 이름", "상태", "등록일", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-ink-muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--color-ink-muted)",
                    fontSize: 13,
                  }}
                >
                  관리자 계정이 없습니다.
                </td>
              </tr>
            )}
            {members.map((m) => {
              const isSelf = m.id === currentUserId;
              const isDisabled = !!m.disabled_at;
              const isEditing = editingId === m.id;
              const isLoading = loading === m.id;

              return (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: "1px solid var(--color-line)",
                    opacity: isDisabled ? 0.55 : 1,
                  }}
                >
                  {/* 이메일 */}
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-ink)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {m.email}
                      {isSelf && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 6px",
                            background: "rgba(20,117,107,0.1)",
                            color: "var(--color-accent)",
                            borderRadius: 4,
                            letterSpacing: "0.04em",
                          }}
                        >
                          나
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 표시 이름 */}
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        style={{ ...inputStyle, width: 160 }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(m.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                        {m.display_name ?? (
                          <span style={{ color: "var(--color-ink-muted)" }}>—</span>
                        )}
                      </span>
                    )}
                  </td>

                  {/* 상태 */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: isDisabled ? "#f3f4f6" : "#dcfce7",
                        color: isDisabled ? "#6b7280" : "#15803d",
                      }}
                    >
                      {isDisabled ? "비활성" : "활성"}
                    </span>
                  </td>

                  {/* 등록일 */}
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {new Date(m.created_at).toLocaleDateString("ko-KR")}
                  </td>

                  {/* 액션 */}
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}
                    >
                      {isEditing ? (
                        <>
                          <Btn
                            variant="primary"
                            onClick={() => handleUpdate(m.id)}
                            disabled={isLoading}
                          >
                            저장
                          </Btn>
                          <Btn variant="ghost" onClick={() => setEditingId(null)}>
                            취소
                          </Btn>
                        </>
                      ) : (
                        <>
                          <Btn
                            variant="ghost"
                            onClick={() => {
                              setEditingId(m.id);
                              setEditDisplayName(m.display_name ?? "");
                            }}
                          >
                            수정
                          </Btn>
                          {!isSelf && (
                            <>
                              {isDisabled ? (
                                <Btn
                                  variant="ghost"
                                  onClick={() => handleEnable(m.id)}
                                  disabled={isLoading}
                                >
                                  활성화
                                </Btn>
                              ) : (
                                <Btn
                                  variant="ghost"
                                  onClick={() => handleDisable(m.id)}
                                  disabled={isLoading}
                                >
                                  비활성화
                                </Btn>
                              )}
                              <Btn
                                variant="danger"
                                onClick={() => handleDelete(m.id)}
                                disabled={isLoading}
                              >
                                삭제
                              </Btn>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
