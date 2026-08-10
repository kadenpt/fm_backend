export type UserOtp = {
  id: number;
  user_id: number;
  code_hash: string;
  expires_at: Date;
  attempts: number;
  consumed_at: Date | null;
};

export type VerifyOtpBody = {
  email: string;
  code: string;
};

export type AuthMessageResponse = {
  message: string;
};
