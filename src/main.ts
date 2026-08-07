import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chat App API')
    .setDescription('Authentication and chat endpoints')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, swaggerConfig),
    { swaggerOptions: { persistAuthorization: true } },
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
