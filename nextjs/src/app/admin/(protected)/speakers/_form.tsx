"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSpeaker, updateSpeaker } from "@/app/admin/_actions/speakers";
import { uploadSpeakerImage } from "@/app/admin/_actions/upload";
import type { SpeakerFormValues } from "@/app/admin/_actions/speakers";
import type { CategoryWithSubs, Speaker } from "@/lib/database.types";
import { Icon } from "@/components/icon";

type ScalarFields = Omit<
  SpeakerFormValues,
  "bio" | "topics" | "subcategory_ids" | "recommended_ids" | "careers" | "videos" | "reviews"
>;

interface Props {
  mode: "create" | "edit";
  defaultValues: SpeakerFormValues;
  categoriesWithSubs: CategoryWithSubs[];
  allSpeakers: Speaker[];
}

export function SpeakerForm({ mode, defaultValues, categoriesWithSubs, allSpeakers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScalarFields>({
    defaultValues: {
      id: defaultValues.id,
      name: defaultValues.name,
      name_en: defaultValues.name_en,
      title: defaultValues.title,
      tagline: defaultValues.tagline,
      portrait_url: defaultValues.portrait_url,
      hero_color: defaultValues.hero_color,
      fee_level: defaultValues.fee_level,
      featured: defaultValues.featured,
      display_order: defaultValues.display_order,
      stats_talks: defaultValues.stats_talks,
      stats_companies: defaultValues.stats_companies,
      stats_years: defaultValues.stats_years,
    },
  });

  const portraitUrl = watch("portrait_url");
  const [portraitUploading, setPortraitUploading] = useState(false);
  const [videoThumbUploading, setVideoThumbUploading] = useState<Record<number, boolean>>({});

  const [bio, setBio] = useState<string[]>(
    defaultValues.bio.length ? defaultValues.bio : [""]
  );
  const [topics, setTopics] = useState<string[]>(
    defaultValues.topics.length ? defaultValues.topics : [""]
  );
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>(defaultValues.subcategory_ids);
  const [recommendedIds, setRecommendedIds] = useState<string[]>(defaultValues.recommended_ids);
  const [careers, setCareers] = useState(
    defaultValues.careers.length ? defaultValues.careers : [{ year: "", role: "" }]
  );
  const [videos, setVideos] = useState(defaultValues.videos);
  const [reviews, setReviews] = useState(defaultValues.reviews);

  const onSubmit = handleSubmit((scalars) => {
    startTransition(async () => {
      const values: SpeakerFormValues = {
        ...scalars,
        bio: bio.filter(Boolean),
        topics: topics.filter(Boolean),
        subcategory_ids: subcategoryIds,
        recommended_ids: recommendedIds,
        careers,
        videos,
        reviews,
      };

      const result =
        mode === "create"
          ? await createSpeaker(values)
          : await updateSpeaker(defaultValues.id, values);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("저장되었습니다.");
        router.push("/admin/speakers");
      }
    });
  });

  const toggleArrayId = (
    arr: string[],
    setArr: (v: string[]) => void,
    id: string
  ) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const handlePortraitUpload = async (file: File) => {
    setPortraitUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSpeakerImage(fd);
      if (result.error) toast.error(result.error);
      else setValue("portrait_url", result.url!);
    } finally {
      setPortraitUploading(false);
    }
  };

  const handleThumbUpload = async (file: File, videoIndex: number) => {
    setVideoThumbUploading((prev) => ({ ...prev, [videoIndex]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSpeakerImage(fd);
      if (result.error) toast.error(result.error);
      else {
        const next = [...videos];
        next[videoIndex] = { ...next[videoIndex], thumb_url: result.url! };
        setVideos(next);
      }
    } finally {
      setVideoThumbUploading((prev) => ({ ...prev, [videoIndex]: false }));
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ padding: "32px 48px", maxWidth: 900 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
            {mode === "create" ? "새 연사 추가" : "연사 수정"}
          </h1>
          {mode === "edit" && (
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--color-ink-muted)" }}>
              ID: {defaultValues.id}
            </p>
          )}
        </div>

        {/* 기본 정보 */}
        <Section title="기본 정보">
          <FieldGrid cols={2}>
            {mode === "create" && (
              <Field label="ID (슬러그)" required error={errors.id?.message}>
                <input
                  {...register("id", {
                    required: "필수 항목입니다",
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: "영문 소문자, 숫자, 하이픈만 허용됩니다",
                    },
                  })}
                  placeholder="kim-jihyun"
                  style={inp(!!errors.id)}
                />
              </Field>
            )}
            <Field label="이름 (국문)" required error={errors.name?.message}>
              <input
                {...register("name", { required: "필수 항목입니다" })}
                placeholder="김지현"
                style={inp(!!errors.name)}
              />
            </Field>
            <Field label="이름 (영문)">
              <input {...register("name_en")} placeholder="Jihyun Kim" style={inp()} />
            </Field>
            <Field label="직함" required error={errors.title?.message} span={2}>
              <input
                {...register("title", { required: "필수 항목입니다" })}
                placeholder="前 글로벌 테크 조직문화 총괄"
                style={inp(!!errors.title)}
              />
            </Field>
            <Field label="태그라인" span={2}>
              <input
                {...register("tagline")}
                placeholder='"일하는 방식을 설계하면, 성과는 따라온다."'
                style={inp()}
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* 외관 / 노출 */}
        <Section title="외관 / 노출">
          <FieldGrid cols={2}>
            <Field label="프로필 이미지" span={2}>
              <input type="hidden" {...register("portrait_url")} />
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {portraitUrl && (
                  <img
                    src={portraitUrl}
                    alt="프로필 미리보기"
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--color-line)", flexShrink: 0 }}
                  />
                )}
                <div>
                  <label
                    style={{
                      ...addBtn,
                      display: "inline-block",
                      cursor: portraitUploading ? "not-allowed" : "pointer",
                      opacity: portraitUploading ? 0.6 : 1,
                    }}
                  >
                    {portraitUploading ? "업로드 중…" : portraitUrl ? "이미지 교체" : "이미지 업로드"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={portraitUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePortraitUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {portraitUrl && (
                    <button
                      type="button"
                      onClick={() => setValue("portrait_url", "")}
                      style={{ ...removeBtn, marginLeft: 8, width: "auto", height: "auto", padding: "6px 10px", fontSize: 12 }}
                    >
                      삭제
                    </button>
                  )}
                  <p style={{ marginTop: 6, fontSize: 11, color: "var(--color-ink-muted)" }}>
                    JPG, PNG, WebP 권장 · 모든 이미지는 speaker-images 폴더에 저장됩니다
                  </p>
                </div>
              </div>
            </Field>
            <Field label="히어로 배경색">
              <input
                {...register("hero_color")}
                placeholder="#2c2a26"
                style={inp()}
              />
            </Field>
            <Field label="요금 등급">
              <select {...register("fee_level")} style={inp()}>
                {(["S", "A", "B", "C"] as const).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="노출 순서">
              <input
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                style={inp()}
              />
            </Field>
            <Field label="메인 추천 노출">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                <input
                  type="checkbox"
                  {...register("featured")}
                  style={{ width: 16, height: 16, accentColor: "var(--color-accent)" }}
                />
                <span style={{ color: "var(--color-ink-soft)" }}>홈 Featured 섹션에 표시</span>
              </label>
            </Field>
          </FieldGrid>
        </Section>

        {/* 통계 */}
        <Section title="통계">
          <FieldGrid cols={3}>
            <Field label="강연 횟수">
              <input
                type="number"
                {...register("stats_talks", { valueAsNumber: true })}
                style={inp()}
              />
            </Field>
            <Field label="기업 수">
              <input
                type="number"
                {...register("stats_companies", { valueAsNumber: true })}
                style={inp()}
              />
            </Field>
            <Field label="경력 연수">
              <input
                type="number"
                {...register("stats_years", { valueAsNumber: true })}
                style={inp()}
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* 소개글 */}
        <Section title="소개글">
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
                placeholder="단락을 입력하세요"
                style={{ ...inp(), resize: "vertical", flex: 1 }}
              />
              {bio.length > 1 && (
                <button
                  type="button"
                  onClick={() => setBio(bio.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setBio([...bio, ""])} style={addBtn}>
            + 단락 추가
          </button>
        </Section>

        {/* 강연 주제 */}
        <Section title="강연 주제">
          {topics.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={t}
                onChange={(e) => {
                  const next = [...topics];
                  next[i] = e.target.value;
                  setTopics(next);
                }}
                placeholder="강연 주제를 입력하세요"
                style={{ ...inp(), flex: 1 }}
              />
              {topics.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTopics(topics.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setTopics([...topics, ""])} style={addBtn}>
            + 주제 추가
          </button>
        </Section>

        {/* 카테고리 */}
        <Section title="카테고리">
          {categoriesWithSubs.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-ink-muted)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {cat.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {cat.subcategories.map((sub) => {
                  const checked = subcategoryIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        background: checked ? "var(--color-accent-soft)" : "var(--color-bg)",
                        border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-line)"}`,
                        borderRadius: 100,
                        fontSize: 12,
                        color: checked ? "var(--color-accent)" : "var(--color-ink-soft)",
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "all 120ms",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayId(subcategoryIds, setSubcategoryIds, sub.id)}
                        style={{ display: "none" }}
                      />
                      {sub.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </Section>

        {/* 추천 연사 */}
        <Section title="추천 연사">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allSpeakers
              .filter((s) => s.id !== defaultValues.id)
              .map((s) => {
                const checked = recommendedIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      background: checked ? "var(--color-accent-soft)" : "var(--color-bg)",
                      border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-line)"}`,
                      borderRadius: 100,
                      fontSize: 12,
                      color: checked ? "var(--color-accent)" : "var(--color-ink-soft)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArrayId(recommendedIds, setRecommendedIds, s.id)}
                      style={{ display: "none" }}
                    />
                    {s.name}
                  </label>
                );
              })}
          </div>
        </Section>

        {/* 경력 */}
        <Section title="경력">
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
                style={{ ...inp(), width: 120, flexShrink: 0 }}
              />
              <input
                value={c.role}
                onChange={(e) => {
                  const next = [...careers];
                  next[i] = { ...next[i], role: e.target.value };
                  setCareers(next);
                }}
                placeholder="삼성전자 부사장"
                style={{ ...inp(), flex: 1 }}
              />
              {careers.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCareers(careers.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCareers([...careers, { year: "", role: "" }])}
            style={addBtn}
          >
            + 경력 추가
          </button>
        </Section>

        {/* 영상 */}
        <Section title="영상">
          {videos.map((v, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-line)",
                borderRadius: 6,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  영상 {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
              <FieldGrid cols={2}>
                <Field label="제목">
                  <input
                    value={v.title}
                    onChange={(e) => {
                      const next = [...videos];
                      next[i] = { ...next[i], title: e.target.value };
                      setVideos(next);
                    }}
                    placeholder="강연 제목"
                    style={inp()}
                  />
                </Field>
                <Field label="재생 시간">
                  <input
                    value={v.duration}
                    onChange={(e) => {
                      const next = [...videos];
                      next[i] = { ...next[i], duration: e.target.value };
                      setVideos(next);
                    }}
                    placeholder="42:30"
                    style={inp()}
                  />
                </Field>
                <Field label="영상 URL" span={2}>
                  <input
                    value={v.video_url}
                    onChange={(e) => {
                      const next = [...videos];
                      next[i] = { ...next[i], video_url: e.target.value };
                      setVideos(next);
                    }}
                    placeholder="https://youtube.com/..."
                    style={inp()}
                  />
                </Field>
                <Field label="썸네일 이미지" span={2}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {v.thumb_url && (
                      <img
                        src={v.thumb_url}
                        alt="썸네일 미리보기"
                        style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4, border: "1px solid var(--color-line)", flexShrink: 0 }}
                      />
                    )}
                    <div>
                      <label
                        style={{
                          ...addBtn,
                          display: "inline-block",
                          cursor: videoThumbUploading[i] ? "not-allowed" : "pointer",
                          opacity: videoThumbUploading[i] ? 0.6 : 1,
                        }}
                      >
                        {videoThumbUploading[i] ? "업로드 중…" : v.thumb_url ? "썸네일 교체" : "썸네일 업로드"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          disabled={!!videoThumbUploading[i]}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbUpload(file, i);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {v.thumb_url && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...videos];
                            next[i] = { ...next[i], thumb_url: "" };
                            setVideos(next);
                          }}
                          style={{ ...removeBtn, marginLeft: 8, width: "auto", height: "auto", padding: "6px 10px", fontSize: 12 }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </Field>
              </FieldGrid>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setVideos([...videos, { title: "", duration: "", video_url: "", thumb_url: "" }])
            }
            style={addBtn}
          >
            + 영상 추가
          </button>
        </Section>

        {/* 후기 */}
        <Section title="후기">
          {reviews.map((r, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-line)",
                borderRadius: 6,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  후기 {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setReviews(reviews.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
              <FieldGrid cols={2}>
                <Field label="회사">
                  <input
                    value={r.company}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[i] = { ...next[i], company: e.target.value };
                      setReviews(next);
                    }}
                    placeholder="삼성전자"
                    style={inp()}
                  />
                </Field>
                <Field label="담당자">
                  <input
                    value={r.author}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[i] = { ...next[i], author: e.target.value };
                      setReviews(next);
                    }}
                    placeholder="인사팀장"
                    style={inp()}
                  />
                </Field>
                <Field label="후기 내용" span={2}>
                  <textarea
                    value={r.quote}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[i] = { ...next[i], quote: e.target.value };
                      setReviews(next);
                    }}
                    rows={3}
                    placeholder="강연 후기..."
                    style={{ ...inp(), resize: "vertical" }}
                  />
                </Field>
              </FieldGrid>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setReviews([...reviews, { company: "", author: "", quote: "" }])}
            style={addBtn}
          >
            + 후기 추가
          </button>
        </Section>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
          <button
            type="button"
            onClick={() => router.push("/admin/speakers")}
            style={{
              padding: "10px 24px",
              fontSize: 13,
              color: "var(--color-ink-soft)",
              border: "1px solid var(--color-line)",
              borderRadius: 6,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "10px 28px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: isPending ? "var(--color-ink-muted)" : "var(--color-accent)",
              border: "none",
              borderRadius: 6,
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            {isPending ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-line)",
        borderRadius: 8,
        padding: "24px 28px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-ink)",
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldGrid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "16px 20px",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  span,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  span?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : undefined}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-ink-muted)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-semantic-error)", marginLeft: 3 }}>*</span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: "var(--color-semantic-error)", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Style helpers ────────────────────────────────────────────────────────────

const inp = (hasError = false): React.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--color-ink)",
  background: "var(--color-bg)",
  border: `1px solid ${hasError ? "var(--color-semantic-error)" : "var(--color-line)"}`,
  borderRadius: 6,
  outline: "none",
  fontFamily: "var(--font-kr)",
  display: "block",
});

const removeBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  flexShrink: 0,
  background: "transparent",
  border: "1px solid var(--color-line)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--color-ink-muted)",
};

const addBtn: React.CSSProperties = {
  fontSize: 12,
  color: "var(--color-accent)",
  background: "transparent",
  border: "1px dashed var(--color-accent)",
  borderRadius: 4,
  padding: "6px 12px",
  cursor: "pointer",
  marginTop: 4,
};
