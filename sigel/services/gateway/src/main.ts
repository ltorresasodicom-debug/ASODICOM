import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true, logger: false }),
    { cors: true, bufferLogs: true },
  );

  app.setGlobalPrefix('api/v1', { exclude: ['health', 'metrics'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SIGEL API')
    .setDescription(
      'Sistema Integral de Gestión y Evaluación Local — API REST oficial. ' +
        'Endpoint público para consulta del INGEL, ranking, transparencia y participación ciudadana.',
    )
    .setVersion('1.0.0')
    .setContact('SIGEL Ecuador', 'https://sigel.gob.ec', 'soporte@sigel.gob.ec')
    .addBearerAuth()
    .addTag('autoridades', 'Alcaldes, prefectos, asambleístas')
    .addTag('territorios', 'Provincias, cantones, GADs')
    .addTag('scoring', 'INGEL, ranking, sub-índices')
    .addTag('indicadores', 'Catálogo metodológico')
    .addTag('encuestas', 'Encuestas ciudadanas')
    .addTag('denuncias', 'Denuncias y control social')
    .addTag('alertas', 'Sistema de alertas automáticas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 SIGEL Gateway escuchando en http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger docs: http://0.0.0.0:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
