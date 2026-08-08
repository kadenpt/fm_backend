export type Journal = {
  id: number;
  user_id: number;
  user_text: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateJournalBody = {
  user_id: number;
  user_text: string;
};

export type UpdateJournalBody = {
  user_text?: string;
};
