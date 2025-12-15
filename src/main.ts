import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Backend Finances Neuse API')
      .setDescription('API documentation for Backend Finances Neuse')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Supabase JWT token',
        },
        'bearer',
      )
      .build(),
  );

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });


  app.use(
    '/reference',
    apiReference({
      url: 'api-json',
    }),
  )


  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
