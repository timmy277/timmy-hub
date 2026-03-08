import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from '../../system-logs/system-logs.service';
import { AUDIT_ACTION_KEY, AuditActionOptions } from '../decorators/audit-action.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private systemLogsService: SystemLogsService,
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
        const { user, ip, headers, body, params, query, url, method } = req;
        const userAgent = headers['user-agent'] || 'Unknown';

        return next.handle().pipe(
            tap({
                next: () => {
                    this.systemLogsService.logAction({
                        userId: user?.id,
                        action: auditOptions.action,
                        entityType: this.getEntityType(url),
                        entityId: params.id || body.id || null, // Extract ID from common paths
                        metadata: { method, url, body, query, params },
                        ipAddress: ip,
                        userAgent,
                        status: 'SUCCESS',
                    });
                },
                error: error => {
                    this.systemLogsService.logAction({
                        userId: user?.id,
                        action: auditOptions.action,
                        entityType: this.getEntityType(url),
                        entityId: params.id || body.id || null,
                        metadata: { method, url, body, query, params },
                        ipAddress: ip,
                        userAgent,
                        status: 'FAILED',
                        errorMessage: error.message,
                    });
                },
            }),
        );
    }

    private getEntityType(url: string): string {
        try {
            // Simplified logic: Extract words from path segments. `/api/users/12` -> `users`
            const segments = url.split('?')[0].split('/').filter(Boolean);
            const apiIndex = segments.indexOf('api');
            if (apiIndex !== -1 && segments.length > apiIndex + 1) {
                return segments[apiIndex + 1].toUpperCase();
            }
            return 'SYSTEM';
        } catch {
            return 'SYSTEM';
        }
    }
}
