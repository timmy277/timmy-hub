import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: 'Internal server error' };

        const message: unknown =
            typeof exceptionResponse === 'object' && exceptionResponse !== null
                ? (exceptionResponse as Record<string, unknown>)['message'] ||
                  (exceptionResponse as Record<string, unknown>)['error'] ||
                  'Internal server error'
                : exceptionResponse;

        // Trích xuất field-level errors từ ZodValidationException
        let validationErrors: Record<string, string[]> | undefined;
        if (exception instanceof ZodValidationException) {
            const zodError = exception.getZodError();
            validationErrors = zodError.errors.reduce<Record<string, string[]>>((acc, issue) => {
                const field = issue.path.join('.') || '_root';
                if (!acc[field]) acc[field] = [];
                acc[field].push(issue.message);
                return acc;
            }, {});
        }

        this.logger.error(
            `Exception occurred: ${httpStatus} - ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : '',
        );

        const request = ctx.getRequest<Record<string, unknown>>();

        const responseBody: Record<string, unknown> = {
            success: false,
            message: Array.isArray(message) ? (message as unknown[])[0] : message,
            error: message,
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(request) as string,
        };

        if (validationErrors) {
            responseBody['validationErrors'] = validationErrors;
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
