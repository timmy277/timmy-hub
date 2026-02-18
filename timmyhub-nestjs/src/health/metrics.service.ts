import { Injectable, OnModuleInit } from '@nestjs/common';
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MetricsService implements OnModuleInit {
    // HTTP Metrics
    private readonly httpRequestDuration: Histogram;
    private readonly httpRequestTotal: Counter;
    private readonly httpRequestErrors: Counter;

    // Database Metrics
    private readonly dbQueryDuration: Histogram;
    private readonly dbConnectionsActive: Gauge;
    private readonly dbSlowQueries: Counter;

    // Business Metrics
    private readonly activeUsers: Gauge;
    private readonly cacheHitRate: Gauge;

    constructor(private prisma: PrismaService) {
        // Enable default metrics (CPU, memory, etc.)
        collectDefaultMetrics({ register });

        // HTTP Request Duration
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_ms',
            help: 'HTTP request duration in milliseconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
        });

        // HTTP Request Total
        this.httpRequestTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
        });

        // HTTP Request Errors
        this.httpRequestErrors = new Counter({
            name: 'http_request_errors_total',
            help: 'Total number of HTTP request errors',
            labelNames: ['method', 'route', 'error_type'],
        });

        // Database Query Duration
        this.dbQueryDuration = new Histogram({
            name: 'db_query_duration_ms',
            help: 'Database query duration in milliseconds',
            labelNames: ['operation', 'model'],
            buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
        });

        // Active Database Connections
        this.dbConnectionsActive = new Gauge({
            name: 'db_connections_active',
            help: 'Number of active database connections',
        });

        // Slow Queries
        this.dbSlowQueries = new Counter({
            name: 'db_slow_queries_total',
            help: 'Total number of slow database queries (>1s)',
            labelNames: ['model'],
        });

        // Active Users (online in last 5 minutes)
        this.activeUsers = new Gauge({
            name: 'active_users_total',
            help: 'Number of active users (online in last 5 minutes)',
        });

        // Cache Hit Rate
        this.cacheHitRate = new Gauge({
            name: 'cache_hit_rate',
            help: 'Redis cache hit rate percentage',
        });
    }

    onModuleInit() {
        // Update database metrics every 30 seconds
        setInterval(() => {
            void this.updateDatabaseMetrics();
        }, 30000);
    }

    /**
     * Record HTTP request metrics
     */
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
        this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
        this.httpRequestTotal.inc({ method, route, status_code: statusCode });

        if (statusCode >= 400) {
            this.httpRequestErrors.inc({
                method,
                route,
                error_type: statusCode >= 500 ? 'server_error' : 'client_error',
            });
        }
    }

    /**
     * Record database query metrics
     */
    recordDbQuery(operation: string, model: string, duration: number) {
        this.dbQueryDuration.observe({ operation, model }, duration);

        if (duration > 1000) {
            this.dbSlowQueries.inc({ model });
        }
    }

    /**
     * Update database connection metrics
     */
    private async updateDatabaseMetrics() {
        try {
            // Get active connections
            const connections = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT count(*) as count
                FROM pg_stat_activity
                WHERE datname = current_database()
            `;
            this.dbConnectionsActive.set(Number(connections[0]?.count || 0));

            // Get active users (last 5 minutes)
            const activeUsersResult = await this.prisma.user.count({
                where: {
                    lastLoginAt: {
                        gte: new Date(Date.now() - 5 * 60 * 1000),
                    },
                },
            });
            this.activeUsers.set(activeUsersResult);
        } catch {
            // Silent fail - metrics should not crash the app
        }
    }

    /**
     * Update cache hit rate
     */
    updateCacheHitRate(hitRate: number) {
        this.cacheHitRate.set(hitRate);
    }

    /**
     * Get all metrics in Prometheus format
     */
    async getMetrics(): Promise<string> {
        return register.metrics();
    }

    /**
     * Get current metric values (for JSON API)
     */
    async getCurrentMetrics() {
        const metrics = await register.getMetricsAsJSON();
        return {
            timestamp: new Date().toISOString(),
            metrics: metrics.reduce(
                (acc: Record<string, unknown>, metric: { name: string; values: unknown }) => {
                    acc[metric.name] = metric.values;
                    return acc;
                },
                {},
            ),
        };
    }
}
