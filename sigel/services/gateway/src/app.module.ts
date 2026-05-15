import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TerritoriosModule } from './territorios/territorios.module';
import { AutoridadesModule } from './autoridades/autoridades.module';
import { IndicadoresModule } from './indicadores/indicadores.module';
import { ScoringModule } from './scoring/scoring.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { DenunciasModule } from './denuncias/denuncias.module';
import { AlertasModule } from './alertas/alertas.module';
import { HealthModule } from './health/health.module';
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'postgres',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'sigel',
        password: process.env.DB_PASSWORD ?? 'sigel',
        database: process.env.DB_NAME ?? 'sigel',
        schema: 'sigel',
        autoLoadEntities: true,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST ?? 'redis',
            port: Number(process.env.REDIS_PORT ?? 6379),
          },
          ttl: 300_000,
        }),
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 100 },
      { name: 'long', ttl: 3_600_000, limit: 1000 },
    ]),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
      path: '/graphql',
    }),
    AuthModule,
    UsersModule,
    TerritoriosModule,
    AutoridadesModule,
    IndicadoresModule,
    ScoringModule,
    EncuestasModule,
    DenunciasModule,
    AlertasModule,
    HealthModule,
  ],
})
export class AppModule {}
