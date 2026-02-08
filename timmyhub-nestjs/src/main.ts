import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Set global prefix for all routes except root and docs
  app.setGlobalPrefix('api', {
    exclude: ['/', 'docs', 'docs/{*path}'],
  });

  // Setup Swagger documentation
  setupSwagger(app);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs\n`);
}
bootstrap();

