import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from '../../system-logs/system-logs.service';
import { AUDIT_ACTION_KEY, AuditActionOptions } from '../decorators/audit-action.decorator';
import { AuditHelperService } from '../services/audit-helper.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private systemLogsService: SystemLogsService,
        private auditHelperService: AuditHelperService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditOptions = this.reflector.get<AuditActionOptions>(
            AUDIT_ACTION_KEY,
            context.getHandler(),
        );
        if (!auditOptions) {
            return next.handle();
        }

        const req = context.switchToHttp().getRequest();
        const { user, headers, body, params, query, url, method } = req;
        const userAgent = (headers['user-agent'] as string) || 'Unknown';

        // Try multiple ways to get IP address (proxy-aware)
        const ipAddress = (
            (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            (headers['x-real-ip'] as string) ||
            req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            'Unknown'
        ).replace('::ffff:', ''); // Remove IPv6 prefix

        const entityType = this.getEntityType(url as string);
        const entityId =
            (params.id as string | undefined) || (body?.id as string | undefined) || null;

        let oldValuePromise: Promise<any> | null = null;
        if (entityId && (method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
            oldValuePromise = this.auditHelperService.getEntityState(entityType, entityId);
        }

        return next.handle().pipe(
            tap({
                next: response => {
                    // Execute async logging without blocking
                    void (async () => {
                        let oldValue = null;
                        let newValue = null;

                        // Get old value if captured
                        if (oldValuePromise) {
                            oldValue = await oldValuePromise;
                        }

                        // Get new value from response (for CREATE/UPDATE)
                        if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
                            newValue = response?.data || response;
                            if (newValue && typeof newValue === 'object') {
                                newValue = this.sanitizeValue(newValue);
                            }
                        }

                        // Calculate diff for updates
                        let metadata: any = { method, url, body, query, params };
                        if (oldValue && newValue) {
                            const { changed, diff } = this.auditHelperService.getDiff(
                                oldValue,
                                newValue,
                            );
                            metadata = { ...metadata, changedFields: changed, diff };
                        }

                        this.systemLogsService
                            .logAction({
                                userId: user?.id,
                                action: auditOptions.action,
                                entityType,
                                entityId: entityId || (newValue as any)?.id || undefined,
                                oldValue,
                                newValue,
                                metadata: JSON.parse(JSON.stringify(metadata)),
                                ipAddress,
                                userAgent,
                                status: 'SUCCESS',
                            })
                            .catch(err => console.error('[AUDIT] Failed to save log', err));
                    })();
                },
                error: error => {
                    // Execute async logging without blocking
                    void (async () => {
                        let oldValue = null;
                        if (oldValuePromise) {
                            oldValue = await oldValuePromise;
                        }

                        this.systemLogsService
                            .logAction({
                                userId: user?.id,
                                action: auditOptions.action,
                                entityType,
                                entityId: entityId || undefined,
                                oldValue,
                                newValue: null,
                                metadata: JSON.parse(
                                    JSON.stringify({ method, url, body, query, params }),
                                ),
                                ipAddress,
                                userAgent,
                                status: 'FAILED',
                                errorMessage: error.message,
                            })
                            .catch(err => console.error('[AUDIT] Failed to save log', err));
                    })();
                },
            }),
        );
    }

    private getEntityType(url: string): string {
        try {
            const segments = url.split('?')[0].split('/').filter(Boolean);
            const apiIndex = segments.indexOf('api');

            if (apiIndex !== -1 && segments.length > apiIndex + 1) {
                const mainSegment = segments[apiIndex + 1];

                // Special handling for /rbac routes
                if (mainSegment.toLowerCase() === 'rbac' && segments.length > apiIndex + 2) {
                    const subSegment = segments[apiIndex + 2];
                    // /api/rbac/roles → ROLES, /api/rbac/permissions → PERMISSIONS
                    return subSegment.toUpperCase();
                }

                return mainSegment.toUpperCase();
            }

            return 'SYSTEM';
        } catch {
            return 'SYSTEM';
        }
    }

    private sanitizeValue(value: any): any {
        if (!value || typeof value !== 'object') return value;

        const sanitized: Record<string, any> = { ...value };
        const sensitiveFields = ['passwordHash', 'password', 'token', 'secret'];

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                delete sanitized[field];
            }
        }

        // Convert Decimal to string
        for (const key of Object.keys(sanitized)) {
            if (sanitized[key]?.constructor?.name === 'Decimal') {
                sanitized[key] = sanitized[key].toString();
            }
        }

        return sanitized;
    }
}
