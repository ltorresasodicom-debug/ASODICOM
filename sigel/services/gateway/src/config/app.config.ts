import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.GATEWAY_PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  analyticsUrl: process.env.ANALYTICS_URL ?? 'http://analytics:8000',
  aiUrl: process.env.AI_URL ?? 'http://ai:8001',
  s3Bucket: process.env.S3_BUCKET ?? 'sigel-storage',
}));
