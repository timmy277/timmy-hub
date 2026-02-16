import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useLogger(app.get(Logger));
    app.use(cookieParser());
    app.use(helmet());
    app.use(compression());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

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
// Trigger restart after Redis is up
bootstrap().catch(err => {
    console.error('Failed to start application', err);
    process.exit(1);
});
