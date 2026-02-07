import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes except root and docs
  app.setGlobalPrefix('api', {
    exclude: ['/', 'docs', 'docs/{*path}'],
  });

  // Setup Swagger documentation
  setupSwagger(app);


  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs\n`);
}
bootstrap();

