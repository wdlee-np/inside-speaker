/* global React, Icon, Button */

// ---------- INQUIRY FORM + DRAWER ------------------------------
function InquiryDrawer({ open, onClose, speakerContext }) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(20,19,17,0.5)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 260ms ease",
        }}
      />
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 95,
          width: "min(560px, 100vw)", background: "var(--bg)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 360ms cubic-bezier(.2,.8,.2,1)",
          display: "flex", flexDirection: "column",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="en" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Check Availability</div>
            <div className="serif" style={{ marginTop: 4, fontSize: 22, fontWeight: 400 }}>섭외 문의</div>
          </div>
          <button onClick={onClose} aria-label="닫기" style={{ padding: 8 }}><Icon name="close" /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "32px", flex: 1 }}>
          {speakerContext && (
            <div style={{ marginBottom: 24, padding: 14, background: "var(--accent-soft)", fontSize: 13, color: "var(--brand-teal-800)" }}>
              <strong>{speakerContext.name}</strong> · {speakerContext.title} 연사 문의
            </div>
          )}
          <InquiryForm speaker={speakerContext} onSubmitted={() => {
            setTimeout(onClose, 1600);
          }} />
        </div>
      </aside>
    </>
  );
}
window.InquiryDrawer = InquiryDrawer;

// ---------- InquiryForm (reusable, used in drawer AND speaker page)
function InquiryForm({ compact = false, speaker, onSubmitted }) {
  const [form, setForm] = React.useState({
    company: "", department: "", name: "", email: "", phone: "",
    eventDate: "", audience: "", budget: "", topic: "", message: "",
    speakerId: speaker ? speaker.id : "",
  });
  const [submitted, setSubmitted] = React.useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    // Admin 연동 지점: fetch('/api/inquiry', { body: JSON.stringify(form) })
    console.log("[Inside Speakers Inquiry]", form);
    setSubmitted(true);
    if (onSubmitted) onSubmitted(form);
  };

  if (submitted) {
    return (
      <div style={{ padding: "40px 0", textAlign: compact ? "left" : "center", color: compact ? "#fff" : "var(--ink)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: "var(--accent)", display: "grid", placeItems: "center", color: "#fff", margin: compact ? 0 : "0 auto" }}>
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

  const fieldStyle = {
    width: "100%", padding: "14px 0", fontSize: 15,
    background: "transparent", border: "none",
    borderBottom: "1px solid " + (compact ? "rgba(255,255,255,.3)" : "var(--line-strong)"),
    color: compact ? "#fff" : "var(--ink)",
    outline: "none", fontFamily: "inherit",
  };
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
    color: compact ? "rgba(255,255,255,.6)" : "var(--ink-muted)",
    fontFamily: "var(--font-en)", fontWeight: 500,
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="form-grid">
        <Field label="기업명" required style={labelStyle}>
          <input required value={form.company} onChange={set("company")} placeholder="(주)Inside Company" style={fieldStyle} />
        </Field>
        <Field label="부서명" style={labelStyle}>
          <input value={form.department} onChange={set("department")} placeholder="인재개발팀" style={fieldStyle} />
        </Field>
        <Field label="담당자 성함" required style={labelStyle}>
          <input required value={form.name} onChange={set("name")} placeholder="홍길동" style={fieldStyle} />
        </Field>
        <Field label="이메일" required style={labelStyle}>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="name@company.com" style={fieldStyle} />
        </Field>
        <Field label="연락처" style={labelStyle}>
          <input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" style={fieldStyle} />
        </Field>
        <Field label="희망 일정" style={labelStyle}>
          <input type="date" value={form.eventDate} onChange={set("eventDate")} style={fieldStyle} />
        </Field>
        <Field label="예상 인원" style={labelStyle}>
          <input value={form.audience} onChange={set("audience")} placeholder="120명" style={fieldStyle} />
        </Field>
        <Field label="예산 구간" style={labelStyle}>
          <select value={form.budget} onChange={set("budget")} style={{ ...fieldStyle, appearance: "none" }}>
            <option value="">선택해 주세요</option>
            <option value="A">500만원 이하</option>
            <option value="B">500–1,000만원</option>
            <option value="C">1,000–2,000만원</option>
            <option value="D">2,000만원 이상</option>
            <option value="X">미정 / 상담 희망</option>
          </select>
        </Field>
      </div>
      <Field label="희망 강연 주제" style={labelStyle}>
        <input value={form.topic} onChange={set("topic")} placeholder="예: 임원 대상 생성형 AI 활용법" style={fieldStyle} />
      </Field>
      <Field label="추가 메시지" style={labelStyle}>
        <textarea rows={3} value={form.message} onChange={set("message")} placeholder="강연의 목적, 대상, 사전 참고사항 등" style={{ ...fieldStyle, resize: "vertical", minHeight: 84, padding: "14px 0" }} />
      </Field>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: compact ? "rgba(255,255,255,.55)" : "var(--ink-muted)" }}>
          개인정보 수집 · 이용에 동의합니다. 문의 처리 목적 외 사용되지 않습니다.
        </span>
        <Button variant={compact ? "accent" : "primary"} type="submit">
          <Icon name="arrow" size={14} /> 문의 접수하기
        </Button>
      </div>
    </form>
  );
}
window.InquiryForm = InquiryForm;

function Field({ label, required, children, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={style}>{label}{required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}</span>
      {children}
    </label>
  );
}
