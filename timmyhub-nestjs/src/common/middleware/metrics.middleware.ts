import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../../health/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private metricsService: MetricsService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        // Capture response
        res.on('finish', () => {
            const duration = Date.now() - start;
            const route = this.getRoutePath(req);

            this.metricsService.recordHttpRequest(req.method, route, res.statusCode, duration);
        });

        next();
    }

    private getRoutePath(req: Request): string {
        // Extract route pattern instead of actual path
        // e.g., /api/users/123 -> /api/users/:id

        if (req.route && typeof req.route.path === 'string') {
            return req.route.path as string;
        }
        return req.path;
    }
}
