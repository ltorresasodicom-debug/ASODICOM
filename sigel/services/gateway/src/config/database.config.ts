import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'postgres',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'sigel',
  password: process.env.DB_PASSWORD ?? 'sigel',
  database: process.env.DB_NAME ?? 'sigel',
  schema: 'sigel',
  poolSize: Number(process.env.DB_POOL_SIZE ?? 20),
}));
