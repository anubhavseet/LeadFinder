import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('LeadFinderBootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS with dynamic origin reflection to support credentials across Vite Frontend, Chrome Extension, and Google Maps
  app.enableCors({
    origin: (origin, callback) => {
      // Allow any requesting origin (including localhost and google.com) with credentials
      callback(null, true);
    },
    credentials: true,
  });


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 LeadFinder NestJS GraphQL Backend running at http://localhost:${port}/graphql`);
}
bootstrap();
