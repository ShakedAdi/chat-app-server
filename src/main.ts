import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const allowedOrigin = config.get<string>(
    'ALLOWED_ORIGIN',
    'http://localhost:5173',
  );
  app.enableCors({ origin: allowedOrigin });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const spec = load(
    readFileSync(join(process.cwd(), 'openapi.yaml'), 'utf8'),
  ) as OpenAPIObject;

  SwaggerModule.setup('docs', app, spec, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
