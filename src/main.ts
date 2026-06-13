import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // ── Raw body pour webhooks Stripe (avant le json parser) ──
  app.use('/store/checkout/webhook', express.raw({ type: '*/*' }));
  app.use(express.json({ limit: '200kb' }));

  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev (jeanmoket.com)
      'http://localhost:4201', // Angular dev (simple-store)
      process.env.FRONTEND_URL, // prod
    ].filter(Boolean) as string[],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Labs API running on http://localhost:${port}`);
}

bootstrap();
