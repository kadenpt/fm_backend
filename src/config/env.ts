function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5050),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || requireEnv("JWT_SECRET"),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || requireEnv("JWT_SECRET"),
  resendApiKey: requireEnv("RESEND_API_KEY"),
  resendFromEmail: requireEnv("RESEND_FROM_EMAIL")
}