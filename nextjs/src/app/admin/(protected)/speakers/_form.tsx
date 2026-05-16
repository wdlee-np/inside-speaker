"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSpeaker, updateSpeaker, deleteSpeakerFile } from "@/app/admin/_actions/speakers";
import { uploadSpeakerImage, uploadSpeakerFile, getFileSignedUrl } from "@/app/admin/_actions/upload";
import type { SpeakerFormValues } from "@/app/admin/_actions/speakers";
import type { CategoryWithSubs, Speaker, SpeakerFile, SpeakerFileType } from "@/lib/database.types";
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
  speakerCode?: string | null;
  existingFiles?: SpeakerFile[];
}

export function SpeakerForm({ mode, defaultValues, categoriesWithSubs, allSpeakers, speakerCode, existingFiles = [] }: Props) {
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
      speaker_status: defaultValues.speaker_status ?? "미노출",
      phone: defaultValues.phone ?? "",
      email: defaultValues.email ?? "",
      admin_memo: defaultValues.admin_memo ?? "",
      desired_fee: defaultValues.desired_fee ?? "",
    },
  });

  const portraitUrl = watch("portrait_url");
  const [portraitUploading, setPortraitUploading] = useState(false);
  const [videoThumbUploading, setVideoThumbUploading] = useState<Record<number, boolean>>({});
  const [portraitInputMode, setPortraitInputMode] = useState<"upload" | "url">("upload");
  const [thumbInputModes, setThumbInputModes] = useState<Record<number, "upload" | "url">>({});
  const [files, setFiles] = useState<SpeakerFile[]>(existingFiles);
  const [fileUploading, setFileUploading] = useState<Partial<Record<SpeakerFileType, boolean>>>({});

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
  const [videos, setVideos] = useState(
    defaultValues.videos.map((v) => ({ ...v, media_type: v.media_type ?? ("video" as const) }))
  );
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

  const handleFileUpload = async (file: File, fileType: SpeakerFileType) => {
    setFileUploading((prev) => ({ ...prev, [fileType]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSpeakerFile(defaultValues.id, fileType, fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("파일이 업로드되었습니다.");
        // reload files list — optimistic update with placeholder
        setFiles((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            speaker_id: defaultValues.id,
            file_type: fileType,
            file_url: "",
            file_name: file.name,
            file_size: file.size,
            sort_order: prev.filter((f) => f.file_type === fileType).length,
          } as SpeakerFile,
        ]);
      }
    } finally {
      setFileUploading((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleFileDelete = async (fileId: string) => {
    const result = await deleteSpeakerFile(fileId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
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
            {mode === "create" ? "새 강사 추가" : "강사 수정"}
          </h1>
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
            <Field label="연락처 (전화)">
              <input {...register("phone")} placeholder="010-0000-0000" style={inp()} />
            </Field>
            <Field label="이메일">
              <input {...register("email")} type="email" placeholder="speaker@example.com" style={inp()} />
            </Field>
          </FieldGrid>
        </Section>

        {/* 노출 상태 (REQ-5) */}
        <Section title="노출 상태">
          <FieldGrid cols={2}>
            <Field label="강사 상태" required>
              <select {...register("speaker_status")} style={inp()}>
                <option value="노출">노출</option>
                <option value="등록요청">등록요청</option>
                <option value="미노출">미노출</option>
              </select>
            </Field>
          </FieldGrid>
        </Section>

        {/* 외관 / 노출 */}
        <Section title="외관 / 노출">
          <FieldGrid cols={2}>
            <Field label="프로필 이미지" span={2}>
              <input type="hidden" {...register("portrait_url")} />
              <div style={{ marginBottom: 10, display: "flex", gap: 6 }}>
                {(["upload", "url"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPortraitInputMode(m)}
                    style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 4, cursor: "pointer",
                      background: portraitInputMode === m ? "var(--color-accent)" : "transparent",
                      color: portraitInputMode === m ? "#fff" : "var(--color-ink-muted)",
                      border: `1px solid ${portraitInputMode === m ? "var(--color-accent)" : "var(--color-line)"}`,
                    }}
                  >
                    {m === "upload" ? "파일 업로드" : "URL 직접 입력"}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {portraitUrl && (
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <a href={portraitUrl} target="_blank" rel="noopener noreferrer" download title="이미지 다운로드">
                      <img
                        src={portraitUrl}
                        alt="프로필 미리보기"
                        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--color-line)", display: "block" }}
                      />
                    </a>
                    <a
                      href={portraitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      title="이미지 다운로드"
                      style={{
                        position: "absolute", bottom: 2, right: 2,
                        width: 20, height: 20, borderRadius: 4,
                        background: "rgba(0,0,0,.55)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon name="download" size={11} />
                    </a>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {portraitInputMode === "upload" ? (
                    <>
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
                        JPG, PNG, WebP 권장 · speaker-images 폴더에 저장됩니다
                      </p>
                    </>
                  ) : (
                    <input
                      placeholder="https://example.com/image.jpg"
                      value={portraitUrl ?? ""}
                      onChange={(e) => setValue("portrait_url", e.target.value)}
                      style={inp()}
                    />
                  )}
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

        {/* 추천 강사 */}
        <Section title="추천 강사">
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

        {/* 미디어 자료 */}
        <Section title="미디어 자료">
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
                  미디어 {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                  style={removeBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
              {/* 미디어 타입 선택 (REQ-4) */}
              <div style={{ marginBottom: 14, display: "flex", gap: 6 }}>
                {([
                  { value: "youtube", label: "유튜브" },
                  { value: "video", label: "영상" },
                  { value: "audio", label: "오디오" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const next = [...videos];
                      next[i] = { ...next[i], media_type: opt.value };
                      setVideos(next);
                    }}
                    style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 4, cursor: "pointer",
                      background: v.media_type === opt.value ? "var(--color-accent)" : "transparent",
                      color: v.media_type === opt.value ? "#fff" : "var(--color-ink-muted)",
                      border: `1px solid ${v.media_type === opt.value ? "var(--color-accent)" : "var(--color-line)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
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
                <Field label={v.media_type === "audio" ? "오디오 URL" : v.media_type === "youtube" ? "유튜브 URL" : "영상 URL"} span={2}>
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
                <Field label={v.media_type === "audio" ? "커버 이미지 (선택)" : "썸네일 이미지"} span={2}>
                  <div style={{ marginBottom: 8, display: "flex", gap: 6 }}>
                    {(["upload", "url"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setThumbInputModes((prev) => ({ ...prev, [i]: m }))}
                        style={{
                          fontSize: 11, padding: "4px 12px", borderRadius: 4, cursor: "pointer",
                          background: (thumbInputModes[i] ?? "upload") === m ? "var(--color-accent)" : "transparent",
                          color: (thumbInputModes[i] ?? "upload") === m ? "#fff" : "var(--color-ink-muted)",
                          border: `1px solid ${(thumbInputModes[i] ?? "upload") === m ? "var(--color-accent)" : "var(--color-line)"}`,
                        }}
                      >
                        {m === "upload" ? "파일 업로드" : "URL 직접 입력"}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {v.thumb_url && (
                      <img
                        src={v.thumb_url}
                        alt="썸네일 미리보기"
                        style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4, border: "1px solid var(--color-line)", flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      {(thumbInputModes[i] ?? "upload") === "upload" ? (
                        <>
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
                        </>
                      ) : (
                        <input
                          placeholder="https://example.com/thumbnail.jpg"
                          value={v.thumb_url}
                          onChange={(e) => {
                            const next = [...videos];
                            next[i] = { ...next[i], thumb_url: e.target.value };
                            setVideos(next);
                          }}
                          style={inp()}
                        />
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
              setVideos([...videos, { title: "", duration: "", video_url: "", thumb_url: "", media_type: "video" as const }])
            }
            style={addBtn}
          >
            + 미디어 추가
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

        {/* 어드민 전용 정보 (REQ-2) */}
        <Section title="어드민 전용 정보">
          <FieldGrid cols={2}>
            {speakerCode && (
              <Field label="강사 코드">
                <div style={{ ...inp(), color: "var(--color-ink-muted)", background: "var(--color-bg)", fontFamily: "var(--font-en)" }}>
                  {speakerCode}
                </div>
              </Field>
            )}
            <Field label="희망 강의료">
              <select {...register("desired_fee")} style={inp()}>
                <option value="">선택</option>
                <option value="5만원">5만원</option>
                <option value="10만원">10만원</option>
                <option value="20만원">20만원</option>
                <option value="30만원">30만원</option>
                <option value="40만원">40만원</option>
                <option value="50만원">50만원</option>
                <option value="70만원">70만원</option>
                <option value="100만원 이상">100만원 이상</option>
                <option value="제한 없음">제한 없음</option>
              </select>
            </Field>
            <Field label="어드민 메모" span={2}>
              <textarea
                {...register("admin_memo")}
                rows={3}
                placeholder="내부 참고 사항 (공개 안 됨)"
                style={{ ...inp(), resize: "vertical" }}
              />
            </Field>
          </FieldGrid>

          {/* 파일 첨부 (수정 모드에서만) */}
          {mode === "edit" && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--color-line)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                첨부 파일
              </div>
              <FileSection
                label="강의 자료 (최대 5개)"
                fileType="lecture_material"
                maxCount={5}
                files={files.filter((f) => f.file_type === "lecture_material")}
                uploading={!!fileUploading.lecture_material}
                onUpload={(file) => handleFileUpload(file, "lecture_material")}
                onDelete={handleFileDelete}
              />
              <FileSection
                label="경력 증명서 (선택)"
                fileType="career_cert"
                maxCount={1}
                files={files.filter((f) => f.file_type === "career_cert")}
                uploading={!!fileUploading.career_cert}
                onUpload={(file) => handleFileUpload(file, "career_cert")}
                onDelete={handleFileDelete}
              />
              <FileSection
                label="학력 증명서 (선택)"
                fileType="edu_cert"
                maxCount={1}
                files={files.filter((f) => f.file_type === "edu_cert")}
                uploading={!!fileUploading.edu_cert}
                onUpload={(file) => handleFileUpload(file, "edu_cert")}
                onDelete={handleFileDelete}
              />
              <FileSection
                label="미디어 자료 (어드민 전용)"
                fileType="media"
                maxCount={20}
                files={files.filter((f) => f.file_type === "media")}
                uploading={!!fileUploading.media}
                onUpload={(file) => handleFileUpload(file, "media")}
                onDelete={handleFileDelete}
              />
            </div>
          )}
          {mode === "create" && (
            <p style={{ marginTop: 16, fontSize: 12, color: "var(--color-ink-muted)" }}>
              파일 첨부는 강사를 먼저 저장한 후 수정 화면에서 할 수 있습니다.
            </p>
          )}
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

// ── FileSection ─────────────────────────────────────────────────────────────

function FileSection({
  label,
  fileType,
  maxCount,
  files,
  uploading,
  onUpload,
  onDelete,
}: {
  label: string;
  fileType: SpeakerFileType;
  maxCount: number;
  files: SpeakerFile[];
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}) {
  const canUpload = files.length < maxCount;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {files.map((f) => (
          <div
            key={f.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", background: "var(--color-bg)",
              border: "1px solid var(--color-line)", borderRadius: 4,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
              {f.file_url ? (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await getFileSignedUrl(f.file_url);
                    if (res.url) window.open(res.url, "_blank");
                    else toast.error(res.error ?? "다운로드 실패");
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "var(--color-accent, #14756b)", textDecoration: "underline", textDecorationStyle: "dotted", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}
                  title="클릭하여 다운로드"
                >
                  {f.file_name}
                </button>
              ) : (
                f.file_name
              )}
              {(f.file_size ?? 0) > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--color-ink-muted)" }}>
                  ({((f.file_size ?? 0) / 1024 / 1024).toFixed(1)} MB)
                </span>
              )}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
              {f.file_url && (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await getFileSignedUrl(f.file_url);
                    if (res.url) window.open(res.url, "_blank");
                    else toast.error(res.error ?? "다운로드 실패");
                  }}
                  title="다운로드"
                  style={{ ...removeBtn, width: "auto", height: "auto", padding: "4px 7px", color: "var(--color-ink-soft)" }}
                >
                  <Icon name="download" size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(f.id)}
                style={{ ...removeBtn, width: "auto", height: "auto", padding: "4px 8px", fontSize: 11 }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {canUpload && (
          <label
            style={{
              ...addBtn,
              display: "inline-flex", alignItems: "center", gap: 4,
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "업로드 중…" : `+ ${label.split(" ")[0]} 업로드`}
            <input
              type="file"
              style={{ display: "none" }}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
