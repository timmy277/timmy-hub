import './instrument';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useLogger(app.get(Logger));
    app.use(cookieParser());
    app.use(helmet());
    app.use(compression());

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

    // Chỉ dùng ZodValidationPipe vì toàn bộ DTO dùng createZodDto()
    app.useGlobalPipes(new ZodValidationPipe());

    // Set global prefix for all routes except root and docs
    app.setGlobalPrefix('api', {
        exclude: [
            '/',
            'health',
            'health/{*path}',
            'metrics',
            'metrics/{*path}',
            'docs',
            'docs/{*path}',
        ],
    });

    // Setup Swagger documentation
    setupSwagger(app);

    // Kích hoạt RedisIoAdapter (nếu có Upstash Redis URL trong ENV)
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const port = process.env.PORT ?? 3001;
    const logger = app.get(Logger);
    await app.listen(port);
    logger.log(`\n🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger docs: http://localhost:${port}/docs\n`);
}
// Trigger restart after Redis is up
bootstrap().catch(err => {
    console.error('Failed to start application', err);
    process.exit(1);
});
