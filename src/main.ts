import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ logger: ["error", "warn", "log", "debug", "verbose"]});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  // Interceptor para aplicar @Exclude() / @Expose()
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  // Prefijo global para versionando de la API
  app.setGlobalPrefix("api/v1")

  app.enableCors({ origin: "http://localhost:4200"});

  // Configuración de Swagger global
  const config = new DocumentBuilder()
    .setTitle("Coach IA")
    .setDescription("Sistema integrado con IA coaching, registrando tus consumos diarios")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
