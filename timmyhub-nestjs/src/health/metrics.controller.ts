import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Public } from '../auth/decorators';
import { PrismaService } from '../database/prisma.service';

@Controller('metrics')
@Public()
export class MetricsController {
    constructor(
        private metricsService: MetricsService,
        private prisma: PrismaService,
    ) {}

    @Get()
    @Header('Content-Type', 'text/plain')
    async getMetrics() {
        return this.metricsService.getMetrics();
    }

    @Get('json')
    async getMetricsJson() {
        return this.metricsService.getCurrentMetrics();
    }

    @Get('performance')
    async getPerformance() {
        try {
            // Get active connections (always available)
            const connections = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT count(*) as count
                FROM pg_stat_activity
                WHERE datname = current_database()
            `;

            // Try to get pg_stat_statements data (optional)
            let dbStats: Array<{
                total_queries: bigint;
                avg_duration: number;
                max_duration: number;
            }> = [];
            let slowQueries: Array<{ count: bigint }> = [];

            try {
                dbStats = await this.prisma.$queryRaw<
                    Array<{
                        total_queries: bigint;
                        avg_duration: number;
                        max_duration: number;
                    }>
                >`
                    SELECT
                        count(*) as total_queries,
                        avg(mean_exec_time) as avg_duration,
                        max(mean_exec_time) as max_duration
                    FROM pg_stat_statements
                    WHERE query NOT LIKE '%pg_stat%'
                `;

                slowQueries = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
                    SELECT count(*) as count
                    FROM pg_stat_statements
                    WHERE mean_exec_time > 1000
                    AND query NOT LIKE '%pg_stat%'
                `;
            } catch {
                // pg_stat_statements not enabled - gracefully handle
            }

            const hasStats = dbStats.length > 0;

            return {
                timestamp: new Date().toISOString(),
                database: {
                    activeConnections: Number(connections[0]?.count || 0),
                    ...(hasStats && {
                        totalQueries: Number(dbStats[0]?.total_queries || 0),
                        avgQueryDuration: Math.round(dbStats[0]?.avg_duration || 0),
                        maxQueryDuration: Math.round(dbStats[0]?.max_duration || 0),
                        slowQueriesCount: Number(slowQueries[0]?.count || 0),
                        status:
                            dbStats[0]?.avg_duration && dbStats[0].avg_duration < 50
                                ? '✅ Excellent'
                                : dbStats[0]?.avg_duration && dbStats[0].avg_duration < 200
                                  ? '⚠️ Good'
                                  : '❌ Needs Optimization',
                    }),
                    ...(!hasStats && {
                        note: 'Enable pg_stat_statements extension for detailed query metrics',
                        setup: 'Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;',
                    }),
                },
                memory: {
                    heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                    external: Math.round(process.memoryUsage().external / 1024 / 1024),
                },
                uptime: Math.round(process.uptime()),
            };
        } catch (error) {
            return {
                timestamp: new Date().toISOString(),
                error: 'Failed to fetch performance metrics',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    @Get('cache')
    getCacheStats(): { message: string; note: string } {
        // TODO: Implement Redis cache stats
        // This would require accessing Redis directly
        return {
            message: 'Cache stats endpoint',
            note: 'Requires Redis client integration',
        };
    }
}
