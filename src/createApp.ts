import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function setupVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
  });
}

function setupValidation(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
}

function setupSwagger(app: INestApplication) {
  // https://docs.nestjs.com/openapi/introduction
  const config = new DocumentBuilder()
    .setTitle('Demo API Documentation')
    .setDescription(
      'This documentation is generated by <a href="https://docs.nestjs.com/openapi/introduction" target="_blank">@nestjs/swagger</a>.'
    )
    .addBearerAuth({
      // https://docs.nestjs.com/openapi/security#bearer-authentication
      type: 'http',
      description: `Please enter your accessToken`,
    })
    .setVersion('0.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
}

export async function createApp() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  setupVersioning(app);
  setupValidation(app);
  setupSwagger(app);
  return app;
}
