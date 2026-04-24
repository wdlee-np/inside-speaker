export type FeeLevel = "S" | "A" | "B" | "C";
export type InquiryStatus = "new" | "contacted" | "won" | "lost";
export type AdminRole = "owner" | "editor";

export interface Category {
  id: string;
  label: string;
  label_en: string | null;
  description: string | null;
  sort_order: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  label: string;
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpeakerSubcategory {
  speaker_id: string;
  subcategory_id: string;
}

export interface SpeakerVideo {
  id: string;
  speaker_id: string;
  title: string;
  duration: string | null;
  thumb_url: string | null;
  video_url: string;
  sort_order: number;
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

export interface Inquiry {
  id: string;
  company: string;
  department: string | null;
  contact_name: string;
  phone: string;
  email: string;
  desired_speaker: string | null;
  desired_date: string | null;
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
}

export interface SpeakerWithRelations extends Speaker {
  subcategory_ids: string[];
  videos: SpeakerVideo[];
  reviews: SpeakerReview[];
  careers: SpeakerCareer[];
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
      speaker_videos:        TableDef<SpeakerVideo>;
      speaker_reviews:       TableDef<SpeakerReview>;
      speaker_careers:       TableDef<SpeakerCareer>;
      inquiries:             TableDef<Inquiry>;
      admin_users:           TableDef<AdminUser>;
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
