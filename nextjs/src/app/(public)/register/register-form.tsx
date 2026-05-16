"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import type { CategoryWithSubs } from "@/lib/database.types";
import { publicRegisterSpeaker, type PublicRegisterValues } from "@/app/admin/_actions/register";
import { uploadPublicRegistrationFile } from "@/app/admin/_actions/upload";
import { Icon } from "@/components/icon";

interface Props {
  categoriesWithSubs: CategoryWithSubs[];
}

interface UploadedDoc {
  path: string;
  name: string;
  size: number;
}

type UploadingKey = "portrait" | "lecture_material" | "career_cert" | "edu_cert" | "media" | null;

const FEE_OPTIONS = [
  { value: "", label: "선택해 주세요" },
  { value: "시간당 5만원 이상", label: "시간당 5만원 이상" },
  { value: "시간당 10만원 이상", label: "시간당 10만원 이상" },
  { value: "시간당 20만원 이상", label: "시간당 20만원 이상" },
  { value: "시간당 30만원 이상", label: "시간당 30만원 이상" },
  { value: "시간당 40만원 이상", label: "시간당 40만원 이상" },
  { value: "시간당 50만원 이상", label: "시간당 50만원 이상" },
  { value: "시간당 70만원 이상", label: "시간당 70만원 이상" },
  { value: "시간당 100만원 이상", label: "시간당 100만원 이상" },
  { value: "제한 없음", label: "제한 없음" },
];

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

export function RegisterForm({ categoriesWithSubs }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<UploadingKey>(null);
  const [showCertDialog, setShowCertDialog] = useState(false);

  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [desiredFee, setDesiredFee] = useState("");

  const [portraitMode, setPortraitMode] = useState<"file" | "url">("file");
  const [portraitUrl, setPortraitUrl] = useState("");

  const [statsTalks, setStatsTalks] = useState("");
  const [statsCompanies, setStatsCompanies] = useState("");
  const [statsYears, setStatsYears] = useState("");
  const [bio, setBio] = useState<string[]>([""]);
  const [topics, setTopics] = useState<string[]>([""]);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [careers, setCareers] = useState<{ year: string; role: string }[]>([{ year: "", role: "" }]);

  const [mediaFiles, setMediaFiles] = useState<UploadedDoc[]>([]);
  const [lectureFiles, setLectureFiles] = useState<UploadedDoc[]>([]);
  const [careerCert, setCareerCert] = useState<UploadedDoc | null>(null);
  const [eduCert, setEduCert] = useState<UploadedDoc | null>(null);

  const toggleSub = (id: string) =>
    setSubcategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleFileChange = async (
    key: "portrait" | "lecture_material" | "career_cert" | "edu_cert" | "media",
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (key === "lecture_material" && lectureFiles.length >= 5) {
      setError("강의 자료는 최대 5개까지 업로드할 수 있습니다.");
      return;
    }

    if (key === "media" && file.size > MAX_MEDIA_BYTES) {
      setError("파일 크기가 10MB를 초과합니다. 대용량 파일은 contact@insidecompany.co.kr 로 이메일 문의 주세요.");
      return;
    }

    setError(null);
    setUploadingKey(key);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadPublicRegistrationFile(key === "media" ? "media" : key, fd);
    setUploadingKey(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (key === "portrait") {
      setPortraitUrl(result.url!);
    } else if (key === "lecture_material") {
      setLectureFiles((prev) => [...prev, { path: result.path!, name: result.name!, size: result.size! }]);
    } else if (key === "career_cert") {
      setCareerCert({ path: result.path!, name: result.name!, size: result.size! });
    } else if (key === "edu_cert") {
      setEduCert({ path: result.path!, name: result.name!, size: result.size! });
    } else if (key === "media") {
      setMediaFiles((prev) => [...prev, { path: result.path!, name: result.name!, size: result.size! }]);
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const values: PublicRegisterValues = {
      name,
      name_en: nameEn,
      title,
      tagline,
      portrait_url: portraitUrl,
      phone,
      email,
      desired_fee: desiredFee,
      stats_talks: parseInt(statsTalks) || 0,
      stats_companies: parseInt(statsCompanies) || 0,
      stats_years: parseInt(statsYears) || 0,
      bio: bio.filter(Boolean),
      topics: topics.filter(Boolean),
      subcategory_ids: subcategoryIds,
      careers: careers.filter((c) => c.year && c.role),
      media_files: mediaFiles,
      lecture_files: lectureFiles,
      career_cert: careerCert,
      edu_cert: eduCert,
    };

    const result = await publicRegisterSpeaker(values);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !title || !phone || !email) return;
    if (lectureFiles.length === 0) {
      setError("강의 자료를 1개 이상 업로드해주세요.");
      return;
    }

    if (!careerCert && !eduCert) {
      setShowCertDialog(true);
      return;
    }

    await doSubmit();
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "var(--font-kr)",
    borderRadius: 4,
    boxSizing: "border-box",
  };

  const canSubmit = !submitting && !!name && !!title && !!phone && !!email && lectureFiles.length > 0;

  return (
    <>
      {/* 증명서 미첨부 확인 다이얼로그 */}
      {showCertDialog && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(20,19,17,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface, #fff)",
              maxWidth: 480, width: "calc(100% - 40px)",
              padding: "36px 32px",
              borderRadius: 6,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, margin: "0 0 12px", color: "var(--ink)" }}>
              증명서를 첨부하지 않으셨습니다
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, margin: "0 0 28px" }}>
              강사 노출을 위해서 추후 필수 제출해야하며 미등록시 담당자가 검토 후 필요시 연락드릴 예정입니다.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowCertDialog(false)}
                style={{
                  padding: "10px 22px", fontSize: 13,
                  background: "transparent", border: "1px solid var(--line)",
                  borderRadius: 4, cursor: "pointer", color: "var(--ink-soft)",
                }}
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowCertDialog(false);
                  await doSubmit();
                }}
                disabled={submitting}
                style={{
                  padding: "10px 22px", fontSize: 13, fontWeight: 600,
                  background: "var(--accent)", color: "#fff",
                  border: "none", borderRadius: 4,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                <Icon name="arrow" size={14} /> 등록 신청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 등록 완료 모달 */}
      {submitted && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(20,19,17,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface, #fff)",
              maxWidth: 480, width: "calc(100% - 40px)",
              padding: "44px 36px",
              borderRadius: 6,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: 999,
                background: "var(--accent)", display: "grid", placeItems: "center",
                color: "#fff", margin: "0 auto",
              }}
            >
              <Icon name="check" size={24} />
            </div>
            <h2 className="serif" style={{ marginTop: 24, fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--ink)" }}>
              등록 신청이 접수되었습니다.
            </h2>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75 }}>
              담당자가 검토 후 등록 여부 회신 드리겠습니다.<br />
              궁금하신 사항은 홈페이지 하단 이메일로 문의 주시면 회신 드리겠습니다.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block", marginTop: 28,
                padding: "11px 28px", fontSize: 13, fontWeight: 600,
                background: "var(--ink)", color: "#fff",
                borderRadius: 4, textDecoration: "none",
              }}
            >
              홈으로 이동
            </a>
          </div>
        </div>
      )}

      <main>
        <div style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          <div className="wrap" style={{ padding: "48px 48px 36px" }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Speaker Registration</div>
            <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
              강사 등록 신청
            </h1>
            <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-muted)", maxWidth: 540 }}>
              Just 강사에 등록 신청을 할 수 있습니다. 검토 후 등록 여부를 연락드립니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="wrap" style={{ padding: "48px 48px", maxWidth: 800 }}>

            {/* 기본 정보 */}
            <FormSection title="기본 정보">
              <Grid cols={2}>
                <FormField label="이름 (국문)" required>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" style={field} />
                </FormField>
                <FormField label="이름 (영문)">
                  <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Gildong Hong" style={field} />
                </FormField>
                <FormField label="직함 / 직위" required span={2}>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="前 삼성전자 부사장" style={field} />
                </FormField>
                <FormField label="태그라인" span={2}>
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="&quot;변화는 기다리는 것이 아니라 만드는 것입니다.&quot;" style={field} />
                </FormField>
                <FormField label="연락처 (전화)" required>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    style={field}
                  />
                </FormField>
                <FormField label="이메일" required>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="speaker@example.com"
                    style={field}
                  />
                </FormField>
                <FormField label="희망 강의료" span={2}>
                  <select value={desiredFee} onChange={(e) => setDesiredFee(e.target.value)} style={{ ...field, appearance: "none" }}>
                    {FEE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </FormField>
              </Grid>
            </FormSection>

            {/* 프로필 이미지 */}
            <FormSection title="프로필 이미지">
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {(["file", "url"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setPortraitMode(m); setPortraitUrl(""); }}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 500,
                      background: portraitMode === m ? "var(--accent, #14756b)" : "transparent",
                      color: portraitMode === m ? "#fff" : "var(--ink-muted)",
                      border: `1px solid ${portraitMode === m ? "var(--accent, #14756b)" : "var(--line)"}`,
                      borderRadius: 4, cursor: "pointer",
                    }}
                  >
                    {m === "file" ? "파일 업로드" : "URL 입력"}
                  </button>
                ))}
              </div>

              {portraitMode === "url" ? (
                <input
                  value={portraitUrl}
                  onChange={(e) => setPortraitUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  style={field}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", fontSize: 13, fontWeight: 500,
                    background: "transparent", color: "var(--ink)",
                    border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
                    opacity: uploadingKey === "portrait" ? 0.6 : 1,
                  }}>
                    <Icon name="plus" size={14} />
                    {uploadingKey === "portrait" ? "업로드 중…" : "이미지 선택"}
                    <input
                      type="file" accept="image/*" style={{ display: "none" }}
                      disabled={uploadingKey === "portrait"}
                      onChange={(e) => handleFileChange("portrait", e)}
                    />
                  </label>
                  {portraitUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={portraitUrl} alt="portrait preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, border: "1px solid var(--line)" }} />
                      <button
                        type="button"
                        onClick={() => setPortraitUrl("")}
                        style={{ ...removeBtn }}
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FormSection>

            {/* 소개글 */}
            <FormSection title="소개글">
              {bio.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <textarea
                    value={p}
                    onChange={(e) => {
                      const next = [...bio];
                      next[i] = e.target.value;
                      setBio(next);
                    }}
                    rows={3}
                    placeholder="소개 단락을 입력하세요"
                    style={{ ...field, resize: "vertical", flex: 1 }}
                  />
                  {bio.length > 1 && (
                    <button type="button" onClick={() => setBio(bio.filter((_, j) => j !== i))} style={removeBtn}>
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setBio([...bio, ""])} style={addBtn}>+ 단락 추가</button>
            </FormSection>

            {/* 강연 주제 */}
            <FormSection title="강연 주제">
              {topics.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    value={t}
                    onChange={(e) => {
                      const next = [...topics];
                      next[i] = e.target.value;
                      setTopics(next);
                    }}
                    placeholder="예: 리더십과 조직문화 혁신"
                    style={{ ...field, flex: 1 }}
                  />
                  {topics.length > 1 && (
                    <button type="button" onClick={() => setTopics(topics.filter((_, j) => j !== i))} style={removeBtn}>
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setTopics([...topics, ""])} style={addBtn}>+ 주제 추가</button>
            </FormSection>

            {/* 경력 */}
            <FormSection title="경력">
              {careers.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input
                    value={c.year}
                    onChange={(e) => {
                      const next = [...careers];
                      next[i] = { ...next[i], year: e.target.value };
                      setCareers(next);
                    }}
                    placeholder="2020–현재"
                    style={{ ...field, width: 140, flexShrink: 0 }}
                  />
                  <input
                    value={c.role}
                    onChange={(e) => {
                      const next = [...careers];
                      next[i] = { ...next[i], role: e.target.value };
                      setCareers(next);
                    }}
                    placeholder="삼성전자 부사장"
                    style={{ ...field, flex: 1 }}
                  />
                  {careers.length > 1 && (
                    <button type="button" onClick={() => setCareers(careers.filter((_, j) => j !== i))} style={removeBtn}>
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setCareers([...careers, { year: "", role: "" }])} style={addBtn}>+ 경력 추가</button>
            </FormSection>

            {/* 강연 통계 */}
            <FormSection title="강연 통계 (선택)">
              <Grid cols={3}>
                <FormField label="강연 횟수">
                  <input type="number" min="0" value={statsTalks} onChange={(e) => setStatsTalks(e.target.value)} placeholder="120" style={field} />
                </FormField>
                <FormField label="기업 수">
                  <input type="number" min="0" value={statsCompanies} onChange={(e) => setStatsCompanies(e.target.value)} placeholder="350" style={field} />
                </FormField>
                <FormField label="경력 연수">
                  <input type="number" min="0" value={statsYears} onChange={(e) => setStatsYears(e.target.value)} placeholder="15" style={field} />
                </FormField>
              </Grid>
            </FormSection>

            {/* 전문 분야 */}
            <FormSection title="전문 분야">
              {categoriesWithSubs.map((cat) => (
                <div key={cat.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {cat.label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {cat.subcategories.map((sub) => {
                      const checked = subcategoryIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 14px",
                            background: checked ? "var(--accent-soft, #e6f4f2)" : "var(--surface)",
                            border: `1px solid ${checked ? "var(--accent)" : "var(--line)"}`,
                            borderRadius: 100,
                            fontSize: 13,
                            color: checked ? "var(--accent)" : "var(--ink-soft)",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input type="checkbox" checked={checked} onChange={() => toggleSub(sub.id)} style={{ display: "none" }} />
                          {sub.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </FormSection>

            {/* 미디어 자료 */}
            <FormSection title="미디어 자료 (선택)">
              <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16, marginTop: 0 }}>
                강의·인터뷰 영상 또는 음성 파일을 업로드하세요. 파일당 최대 10MB이며, 초과 시{" "}
                <a href="mailto:contact@insidecompany.co.kr" style={{ color: "var(--accent)" }}>
                  contact@insidecompany.co.kr
                </a>
                로 이메일 문의 주세요.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                {mediaFiles.map((f, i) => (
                  <FileItem
                    key={i}
                    name={f.name}
                    size={f.size}
                    onRemove={() => setMediaFiles(mediaFiles.filter((_, j) => j !== i))}
                  />
                ))}
              </div>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 18px", fontSize: 13, fontWeight: 500,
                background: "transparent", color: "var(--ink)",
                border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
                opacity: uploadingKey === "media" ? 0.6 : 1,
              }}>
                <Icon name="plus" size={14} />
                {uploadingKey === "media" ? "업로드 중…" : "파일 추가"}
                <input
                  type="file"
                  style={{ display: "none" }}
                  disabled={uploadingKey === "media"}
                  onChange={(e) => handleFileChange("media", e)}
                />
              </label>
            </FormSection>

            {/* 첨부 파일 */}
            <FormSection title="첨부 파일">
              {/* 강의 자료 */}
              <FormField label="강의 자료" required>
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "0 0 10px" }}>
                  강의계획서 강의안 샘플 최소 5페이지 이상 (PDF, PPT, DOC 등 / 파일당 10MB 이하 / 최대 5개)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {lectureFiles.map((f, i) => (
                    <FileItem
                      key={i}
                      name={f.name}
                      size={f.size}
                      onRemove={() => setLectureFiles(lectureFiles.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
                {lectureFiles.length < 5 && (
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", fontSize: 13, fontWeight: 500,
                    background: "transparent", color: "var(--ink)",
                    border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
                    opacity: uploadingKey === "lecture_material" ? 0.6 : 1,
                  }}>
                    <Icon name="plus" size={14} />
                    {uploadingKey === "lecture_material" ? "업로드 중…" : "파일 추가"}
                    <input
                      type="file"
                      style={{ display: "none" }}
                      disabled={uploadingKey === "lecture_material"}
                      onChange={(e) => handleFileChange("lecture_material", e)}
                    />
                  </label>
                )}
              </FormField>

              {/* 경력증명서 */}
              <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--line)" }} />
              <FormField label="경력증명서 (선택)">
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "0 0 10px" }}>
                  경력증명서 또는 재직증명서 (10MB 이하)
                </p>
                {careerCert ? (
                  <FileItem name={careerCert.name} size={careerCert.size} onRemove={() => setCareerCert(null)} />
                ) : (
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", fontSize: 13, fontWeight: 500,
                    background: "transparent", color: "var(--ink)",
                    border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
                    opacity: uploadingKey === "career_cert" ? 0.6 : 1,
                  }}>
                    <Icon name="plus" size={14} />
                    {uploadingKey === "career_cert" ? "업로드 중…" : "파일 선택"}
                    <input
                      type="file"
                      style={{ display: "none" }}
                      disabled={uploadingKey === "career_cert"}
                      onChange={(e) => handleFileChange("career_cert", e)}
                    />
                  </label>
                )}
              </FormField>

              {/* 학력증명서 */}
              <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--line)" }} />
              <FormField label="학력증명서 (선택)">
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "0 0 10px" }}>
                  최종학력증명서 또는 졸업증명서 (10MB 이하)
                </p>
                {eduCert ? (
                  <FileItem name={eduCert.name} size={eduCert.size} onRemove={() => setEduCert(null)} />
                ) : (
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", fontSize: 13, fontWeight: 500,
                    background: "transparent", color: "var(--ink)",
                    border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
                    opacity: uploadingKey === "edu_cert" ? 0.6 : 1,
                  }}>
                    <Icon name="plus" size={14} />
                    {uploadingKey === "edu_cert" ? "업로드 중…" : "파일 선택"}
                    <input
                      type="file"
                      style={{ display: "none" }}
                      disabled={uploadingKey === "edu_cert"}
                      onChange={(e) => handleFileChange("edu_cert", e)}
                    />
                  </label>
                )}
              </FormField>
            </FormSection>

            {error && (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  padding: "12px 32px", fontSize: 14, fontWeight: 600,
                  background: canSubmit ? "var(--accent)" : "var(--ink-muted)",
                  color: "#fff", border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {submitting ? "제출 중…" : <><Icon name="arrow" size={14} /> 등록 신청하기</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

function FileItem({ name, size, onRemove }: { name: string; size: number; onRemove: () => void }) {
  const kb = size / 1024;
  const label = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: "var(--bg, #faf9f6)",
      border: "1px solid var(--line)",
      borderRadius: 4, fontSize: 13,
    }}>
      <Icon name="bookmark" size={14} />
      <span style={{ flex: 1, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ color: "var(--ink-muted)", fontSize: 11, flexShrink: 0 }}>{label}</span>
      <button type="button" onClick={onRemove} style={{ ...removeBtn, width: 24, height: 24 }}>
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--line)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "0 0 20px" }}>{title}</h2>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 20px" }}>
      {children}
    </div>
  );
}

function FormField({
  label, required, span, children,
}: {
  label: string; required?: boolean; span?: number; children: React.ReactNode;
}) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : undefined}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
        {required && <span style={{ color: "var(--accent)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const removeBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, flexShrink: 0,
  background: "transparent", border: "1px solid var(--line)", borderRadius: 4,
  cursor: "pointer", color: "var(--ink-muted)",
};

const addBtn: React.CSSProperties = {
  fontSize: 13, color: "var(--accent)", background: "transparent",
  border: "1px dashed var(--accent)", borderRadius: 4,
  padding: "8px 14px", cursor: "pointer", marginTop: 4,
};
