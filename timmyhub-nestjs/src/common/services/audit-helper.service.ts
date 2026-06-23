import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Helper service to capture old/new values for audit logging
 */
@Injectable()
export class AuditHelperService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get current entity state before update/delete
     */
    async getEntityState(
        entityType: string,
        entityId: string,
    ): Promise<Record<string, unknown> | null> {
        try {
            const modelName = this.getModelName(entityType);
            if (!modelName) return null;

            const entity = await this.prisma[modelName].findUnique({
                where: { id: entityId },
            });

            return entity ? this.sanitizeEntity(entity) : null;
        } catch (error) {
            console.error(`[AuditHelper] Failed to get entity state:`, error);
            return null;
        }
    }

    getDiff(oldValue: any, newValue: any): { changed: string[]; diff: Record<string, any> } {
        const changed: string[] = [];
        const diff: Record<string, any> = {};

        if (!oldValue || !newValue) {
            return { changed, diff };
        }

        // Type guard: ensure newValue is an object
        if (typeof newValue !== 'object' || newValue === null) {
            return { changed, diff };
        }

        for (const key of Object.keys(newValue as Record<string, unknown>)) {
            // Skip system fields
            if (['createdAt', 'updatedAt', 'deletedAt'].includes(key)) {
                continue;
            }

            const oldVal = oldValue[key];
            const newVal = newValue[key];

            // Compare values
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changed.push(key);
                diff[key] = {
                    old: oldVal,
                    new: newVal,
                };
            }
        }

        return { changed, diff };
    }

    /**
     * Sanitize entity by removing sensitive fields
     */
    private sanitizeEntity(entity: any): any {
        // Type guard: ensure entity is an object
        if (!entity || typeof entity !== 'object') {
            return entity;
        }

        const sanitized = { ...entity };

        // Remove sensitive fields
        const sensitiveFields = ['passwordHash', 'password', 'token', 'secret'];
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                delete sanitized[field];
            }
        }

        // Convert Decimal to string for JSON serialization
        for (const key of Object.keys(sanitized as Record<string, unknown>)) {
            if (sanitized[key]?.constructor?.name === 'Decimal') {
                sanitized[key] = sanitized[key].toString();
            }
        }

        return sanitized;
    }

    /**
     * Map entity type to Prisma model name
     */
    private getModelName(entityType: string): string | null {
        const mapping: Record<string, string> = {
            USERS: 'user',
            USER: 'user',
            ORDERS: 'order',
            ORDER: 'order',
            PRODUCTS: 'product',
            PRODUCT: 'product',
            VOUCHERS: 'voucher',
            VOUCHER: 'voucher',
            REVIEWS: 'review',
            REVIEW: 'review',
            CATEGORIES: 'category',
            CATEGORY: 'category',
            ROLES: 'systemRole',
            ROLE: 'systemRole',
            PERMISSIONS: 'permission',
            PERMISSION: 'permission',
            RBAC: 'systemRole', // fallback for /rbac routes
        };

        return mapping[entityType.toUpperCase()] || null;
    }
}
