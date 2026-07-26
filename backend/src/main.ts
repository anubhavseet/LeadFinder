import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('LeadFinderBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Chrome Extension and Vite React Frontend
  app.enableCors({
    origin: '*',
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
