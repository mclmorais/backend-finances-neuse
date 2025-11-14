import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Backend Finances Neuse API')
      .setDescription('API documentation for Backend Finances Neuse')
      .setVersion('1.0')
      .build(),
  );

  app.use(
    '/api',
    apiReference({
      content: cleanupOpenApiDoc(openApiDoc),
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
