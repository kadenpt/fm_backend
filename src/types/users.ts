export type User = {
  id: number;
  first_name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateUserBody = {
  first_name: string;
  email: string;
  password: string;
};

export type UpdateUserBody = {
  first_name?: string;
  email?: string;
  password?: string;
};
