import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Timmy Hub API')
        .setDescription('The API for the Timmy Hub application')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey(
            {
                type: 'apiKey',
                name: 'X-API-KEY',
                in: 'header',
                description: 'API Key for protected endpoints',
            },
            'X-API-KEY',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Timmy Hub API Documentation',
    });
};
