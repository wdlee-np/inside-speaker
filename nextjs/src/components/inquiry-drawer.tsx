"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useInquiry } from "@/app/(public)/inquiry-context";
import { Icon } from "@/components/icon";

export function InquiryDrawer() {
  const { state, closeInquiry } = useInquiry();
  const { open, speaker } = state;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        onClick={closeInquiry}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(20,19,17,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 260ms ease",
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 95,
          width: "min(560px, 100vw)",
          background: "var(--bg)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 360ms cubic-bezier(.2,.8,.2,1)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 32px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            <div
              className="en"
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
              }}
            >
              Check Availability
            </div>
            <div className="serif" style={{ marginTop: 4, fontSize: 22, fontWeight: 400 }}>섭외 문의</div>
          </div>
          <button onClick={closeInquiry} aria-label="닫기" style={{ padding: 8 }}>
            <Icon name="close" />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "32px", flex: 1 }}>
          {speaker && (
            <div
              style={{
                marginBottom: 24,
                padding: 14,
                background: "var(--accent-soft)",
                fontSize: 13,
                color: "var(--brand-teal-800)",
              }}
            >
              <strong>{speaker.name}</strong> · {speaker.title} 연사 문의
            </div>
          )}
          <InquiryForm speakerId={speaker?.id} onSubmitted={() => setTimeout(closeInquiry, 1600)} />
        </div>
      </aside>
    </>
  );
}

interface FormState {
  company: string;
  department: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  audience: string;
  budget: string;
  topic: string;
  message: string;
}

function InquiryForm({
  speakerId,
  compact = false,
  onSubmitted,
}: {
  speakerId?: string;
  compact?: boolean;
  onSubmitted?: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    company: "", department: "", name: "", email: "", phone: "",
    eventDate: "", audience: "", budget: "", topic: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, speakerId }),
    }).catch(() => null);
    setSubmitted(true);
    onSubmitted?.();
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "14px 0", fontSize: 15,
    background: "transparent", border: "none",
    borderBottom: "1px solid " + (compact ? "rgba(255,255,255,.3)" : "var(--line-strong)"),
    color: compact ? "#fff" : "var(--ink)",
    outline: "none", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
    color: compact ? "rgba(255,255,255,.6)" : "var(--ink-muted)",
    fontFamily: "var(--font-en)", fontWeight: 500,
  };

  if (submitted) {
    return (
      <div style={{ padding: "40px 0", textAlign: compact ? "left" : "center", color: compact ? "#fff" : "var(--ink)" }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 999,
            background: "var(--accent)", display: "grid", placeItems: "center",
            color: "#fff", margin: compact ? 0 : "0 auto",
          }}
        >
          <Icon name="check" size={22} />
        </div>
        <h3 className="serif" style={{ marginTop: 20, fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>
          문의가 접수되었습니다.
        </h3>
        <p style={{ marginTop: 10, fontSize: 14, color: compact ? "rgba(255,255,255,.7)" : "var(--ink-muted)" }}>
          담당 에이전트가 24시간 이내에 회신드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="form-grid">
        <FormField label="기업명" required labelStyle={labelStyle}>
          <input required value={form.company} onChange={set("company")} placeholder="(주)Inside Company" style={fieldStyle} />
        </FormField>
        <FormField label="부서명" labelStyle={labelStyle}>
          <input value={form.department} onChange={set("department")} placeholder="인재개발팀" style={fieldStyle} />
        </FormField>
        <FormField label="담당자 성함" required labelStyle={labelStyle}>
          <input required value={form.name} onChange={set("name")} placeholder="홍길동" style={fieldStyle} />
        </FormField>
        <FormField label="이메일" required labelStyle={labelStyle}>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="name@company.com" style={fieldStyle} />
        </FormField>
        <FormField label="연락처" labelStyle={labelStyle}>
          <input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" style={fieldStyle} />
        </FormField>
        <FormField label="희망 일정" labelStyle={labelStyle}>
          <input type="date" value={form.eventDate} onChange={set("eventDate")} style={fieldStyle} />
        </FormField>
        <FormField label="예상 인원" labelStyle={labelStyle}>
          <input value={form.audience} onChange={set("audience")} placeholder="120명" style={fieldStyle} />
        </FormField>
        <FormField label="예산 구간" labelStyle={labelStyle}>
          <select value={form.budget} onChange={set("budget")} style={{ ...fieldStyle, appearance: "none" }}>
            <option value="">선택해 주세요</option>
            <option value="A">500만원 이하</option>
            <option value="B">500–1,000만원</option>
            <option value="C">1,000–2,000만원</option>
            <option value="D">2,000만원 이상</option>
            <option value="X">미정 / 상담 희망</option>
          </select>
        </FormField>
      </div>
      <FormField label="희망 강연 주제" labelStyle={labelStyle}>
        <input value={form.topic} onChange={set("topic")} placeholder="예: 임원 대상 생성형 AI 활용법" style={fieldStyle} />
      </FormField>
      <FormField label="추가 메시지" labelStyle={labelStyle}>
        <textarea
          rows={3}
          value={form.message}
          onChange={set("message")}
          placeholder="강연의 목적, 대상, 사전 참고사항 등"
          style={{ ...fieldStyle, resize: "vertical", minHeight: 84, padding: "14px 0" }}
        />
      </FormField>
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 8, gap: 16, flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: compact ? "rgba(255,255,255,.55)" : "var(--ink-muted)" }}>
          개인정보 수집 · 이용에 동의합니다. 문의 처리 목적 외 사용되지 않습니다.
        </span>
        <button
          type="submit"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 22px", fontSize: 13, fontWeight: 600,
            background: compact ? "var(--accent)" : "var(--ink)",
            color: "#fff", border: "none",
          }}
        >
          <Icon name="arrow" size={14} /> 문의 접수하기
        </button>
      </div>
    </form>
  );
}

export { InquiryForm };

function FormField({
  label,
  required,
  labelStyle,
  children,
}: {
  label: string;
  required?: boolean;
  labelStyle: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}
      </span>
      {children}
    </label>
  );
}
