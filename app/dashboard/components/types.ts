export type User = {
  email: string;
  has_password: boolean;
  phone_e164: string | null;
  phone_verified: boolean;
};

export type TrialStatus = {
  claimed: boolean;
  points_amount: number;
};

export type WalletInfo = {
  user_id: string;
  balance_points: number;
  reserved_points: number;
};

export type WalletActivity = {
  id: string;
  type: "payment" | "point";
  kind: string;
  point_type: string;
  amount_paise: number;
  base_points: number | null;
  bonus_points: number | null;
  total_points: number | null;
  points_delta: number | null;
  balance_after_points: number | null;
  reserved_after_points: number | null;
  currency: string;
  status: string;
  provider: string | null;
  provider_order_id: string | null;
  source_id: string;
  reference_id: string | null;
  note_title?: string | null;
  duration_seconds?: number | null;
  created_at: string;
};

export type WalletPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type WalletOverview = {
  wallet: WalletInfo;
  activities: WalletActivity[];
  pagination: WalletPagination;
};

export type RecentNote = {
  id: string;
  title: string;
  created_at: string;
  duration_seconds: number;
  billing_mode?: string;
  preview_limited?: boolean;
  preview_limit_minutes?: number | null;
};

export type RecentNoteJob = {
  id: string;
  title: string;
  status: string;
  error_code: string;
  error_message: string;
  notes_id: string | null;
  created_at: string;
  updated_at: string;
  duration_seconds: number;
};

export type RecoverableTranscriptSession = {
  id: string;
  title: string;
  status: string;
  mode: string;
  segmentCount: number;
  uploadedDurationMs: number;
  totalDurationMs: number;
  recoveryReason: string;
  recoveryWarning: string;
  recoveryAvailableAt: string | null;
  updatedAt: string;
};

export type NotesPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type BillingDurationRule = {
  id: string;
  rule_set_code: string;
  min_duration_seconds: number;
  max_duration_seconds: number | null;
  charge_points: number;
  label: string;
  sort_order: number;
  active: number;
};

export type BillingRuleSet = {
  id: string;
  code: string;
  product_code: string;
  billing_mode: string;
  active: number;
};

export type PointPackage = {
  code: string;
  name: string;
  price_paise: number;
  currency: string;
  base_points: number;
  bonus_points: number;
  total_points: number;
};

export type PaymentGateway = {
  code: string;
  display_name: string;
  provider_type: string;
  environment: string;
  active: boolean;
  sort_order: number;
};

export type ReferralReward = {
  code: string;
  points_amount: number;
  active: boolean;
};

export type SectionKey = "home" | "wallet" | "notes" | "billing" | "profile" | "downloads";
