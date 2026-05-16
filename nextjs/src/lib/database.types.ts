// REQ-1: "연사" → "강사" 반영 (주석)
// REQ-2: SpeakerPrivate, SpeakerFile 타입 추가
// REQ-4: SpeakerVideo에 media_type 추가
// REQ-5: Speaker에 speaker_status 추가
// REQ-7: Subcategory에 label_en 추가

export type FeeLevel = "S" | "A" | "B" | "C";
export type InquiryStatus = "new" | "contacted" | "won" | "lost";
export type AdminRole = "owner" | "editor";
// REQ-5
export type SpeakerStatus = "노출" | "등록요청" | "미노출";
// REQ-4
export type MediaType = "video" | "audio" | "youtube";

export interface Category {
  id: string;
  label: string;
  label_en: string | null;
  description: string | null;
  sort_order: number;
}

// REQ-7: label_en 추가
export interface Subcategory {
  id: string;
  category_id: string;
  label: string;
  label_en: string | null;
  sort_order: number;
  created_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  name_en: string | null;
  title: string;
  tagline: string | null;
  portrait_url: string | null;
  hero_color: string;
  fee_level: FeeLevel;
  featured: boolean;
  display_order: number;
  stats_talks: number;
  stats_companies: number;
  stats_years: number;
  topics: string[];
  bio: string[];
  recommended_ids: string[];
  topic_groups: { subcategoryId: string | null; topics: string[] }[] | null;
  // REQ-5
  speaker_status: SpeakerStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpeakerSubcategory {
  speaker_id: string;
  subcategory_id: string;
}

export interface SpeakerTopic {
  id: string;
  speaker_id: string;
  subcategory_id: string | null;
  topic_text: string;
  sort_order: number;
}

// REQ-4: media_type 추가
export interface SpeakerVideo {
  id: string;
  speaker_id: string;
  title: string;
  duration: string | null;
  thumb_url: string | null;
  video_url: string;
  sort_order: number;
  media_type: MediaType;
}

export interface SpeakerReview {
  id: string;
  speaker_id: string;
  company: string;
  author: string | null;
  quote: string;
  sort_order: number;
}

export interface SpeakerCareer {
  id: string;
  speaker_id: string;
  year: string;
  role: string;
  sort_order: number;
}

// REQ-2: 어드민 전용 기본 정보
export interface SpeakerPrivate {
  speaker_id: string;
  speaker_code: string | null;
  phone: string | null;
  email: string | null;
  admin_memo: string | null;
  desired_fee: string | null;
  created_at: string;
  updated_at: string;
}

// REQ-2: 파일 (강의안·증명서·미디어)
export type SpeakerFileType = "lecture_material" | "career_cert" | "edu_cert" | "media";

export interface SpeakerFile {
  id: string;
  speaker_id: string;
  file_type: SpeakerFileType;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  sort_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  company: string;
  department: string | null;
  contact_name: string;
  phone: string;
  email: string;
  desired_speaker: string | null;
  desired_date: string | null;
  desired_time: string | null;
  region: string | null;
  budget_range: string | null;
  message: string | null;
  status: InquiryStatus;
  internal_memo: string | null;
  source_url: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  display_name: string | null;
  role: AdminRole;
  created_at: string;
  disabled_at: string | null;
}

export interface SpeakerWithRelations extends Speaker {
  subcategory_ids: string[];
  videos: SpeakerVideo[];
  reviews: SpeakerReview[];
  careers: SpeakerCareer[];
}

// REQ-2: 어드민용 확장 타입
export interface SpeakerWithPrivate extends SpeakerWithRelations {
  private: SpeakerPrivate | null;
  files: SpeakerFile[];
}

export interface CategoryWithSubs extends Category {
  subcategories: Subcategory[];
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export interface Database {
  public: {
    Tables: {
      categories:            TableDef<Category>;
      subcategories:         TableDef<Subcategory>;
      speakers:              TableDef<Speaker>;
      speaker_subcategories: TableDef<SpeakerSubcategory>;
      speaker_topics:        TableDef<SpeakerTopic>;
      speaker_videos:        TableDef<SpeakerVideo>;
      speaker_reviews:       TableDef<SpeakerReview>;
      speaker_careers:       TableDef<SpeakerCareer>;
      speaker_private:       TableDef<SpeakerPrivate>;
      speaker_files:         TableDef<SpeakerFile>;
      inquiries:             TableDef<Inquiry>;
      admin_users:           TableDef<AdminUser>;
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
