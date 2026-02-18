import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Service để cleanup tokens hết hạn
 * Có thể chạy manual hoặc setup cron job
 */
@Injectable()
export class AuthCleanupService {
    private readonly logger = new Logger(AuthCleanupService.name);

    constructor(private prisma: PrismaService) {}

    /**
     * Cleanup refresh tokens đã hết hạn hoặc bị revoked
     * Nên chạy định kỳ (daily hoặc hourly)
     */
    async cleanupExpiredTokens(): Promise<number> {
        this.logger.log('🧹 Starting cleanup of expired refresh tokens...');

        try {
            const result = await this.prisma.refreshToken.deleteMany({
                where: {
                    OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
                },
            });

            this.logger.log(`✅ Cleaned up ${result.count} expired/revoked tokens`);
            return result.count;
        } catch (error) {
            this.logger.error('❌ Error during token cleanup:', error);
            throw error;
        }
    }

    /**
     * Cleanup inactive devices (không active > 30 ngày)
     */
    async cleanupInactiveDevices(): Promise<number> {
        this.logger.log('🧹 Starting cleanup of inactive devices...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            // Xóa tokens của devices không active
            const tokensDeleted = await this.prisma.refreshToken.deleteMany({
                where: {
                    device: {
                        isActive: false,
                        lastActiveAt: { lt: thirtyDaysAgo },
                    },
                },
            });

            // Xóa devices
            const devicesDeleted = await this.prisma.device.deleteMany({
                where: {
                    isActive: false,
                    lastActiveAt: { lt: thirtyDaysAgo },
                },
            });

            this.logger.log(
                `✅ Cleaned up ${devicesDeleted.count} devices and ${tokensDeleted.count} tokens`,
            );
            return devicesDeleted.count;
        } catch (error) {
            this.logger.error('❌ Error during device cleanup:', error);
            throw error;
        }
    }

    /**
     * Get statistics về tokens
     */
    async getTokenStatistics() {
        const [total, expired, revoked, valid] = await Promise.all([
            this.prisma.refreshToken.count(),
            this.prisma.refreshToken.count({
                where: { expiresAt: { lt: new Date() } },
            }),
            this.prisma.refreshToken.count({
                where: { isRevoked: true },
            }),
            this.prisma.refreshToken.count({
                where: {
                    AND: [{ expiresAt: { gte: new Date() } }, { isRevoked: false }],
                },
            }),
        ]);

        return {
            total,
            expired,
            revoked,
            valid,
            needsCleanup: expired + revoked,
        };
    }
}
