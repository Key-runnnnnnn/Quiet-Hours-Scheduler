export interface QuietHour {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  reminder_sent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateQuietHourInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface UpdateQuietHourInput extends Partial<CreateQuietHourInput> {
  is_active?: boolean;
}
