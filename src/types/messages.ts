export type Message = {
  id: number;
  message_description: string;
  focus: string | null;
  message_type: string;
  created_at: Date;
};

export type CreateMessageBody = {
  message_description: string;
  focus?: string | null;
  message_type: string;
};

export type UpdateMessageBody = {
  message_description?: string;
  focus?: string | null;
  message_type?: string;
};
