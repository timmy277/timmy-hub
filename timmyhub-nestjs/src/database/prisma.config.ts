import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Production-ready Prisma configuration
 * Optimized for connection pooling and performance
 */
export const prismaConfig: Prisma.PrismaClientOptions = {
    log:
        process.env.NODE_ENV === 'production'
            ? ['error', 'warn']
            : ['query', 'info', 'warn', 'error'],

    // Error formatting
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'colorless',

    // Connection pool configuration (handled by DATABASE_URL connection string)
    // Add to your DATABASE_URL: ?connection_limit=10&pool_timeout=20
};

interface DatabaseMetrics {
    activeConnections: number;
    slowQueriesCount: number;
    error?: string;
}

export const getDatabaseMetrics = async (prisma: PrismaClient): Promise<DatabaseMetrics> => {
    try {
        // Get active connections count
        const connections = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT count(*) as count
            FROM pg_stat_activity
            WHERE datname = current_database()
        `;

        // Try to get slow queries (requires pg_stat_statements extension)
        let slowQueriesCount = 0;
        try {
            const slowQueries = await prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT count(*) as count
                FROM pg_stat_statements
                WHERE mean_exec_time > 1000
            `;
            slowQueriesCount = Number(slowQueries[0]?.count || 0);
        } catch {
            // pg_stat_statements not enabled - skip
        }

        return {
            activeConnections: Number(connections[0]?.count || 0),
            slowQueriesCount,
        };
    } catch (error) {
        return {
            activeConnections: 0,
            slowQueriesCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
