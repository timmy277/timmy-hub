import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateSystemLogDto {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: unknown;
    newValue?: unknown;
    metadata?: unknown;
    ipAddress?: string;
    userAgent?: string;
    status?: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
}

export interface DiffItem {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    type: 'added' | 'modified' | 'removed';
}

@Injectable()
export class SystemLogsService {
    private readonly logger = new Logger(SystemLogsService.name);

    constructor(private readonly prisma: PrismaService) {}

    async logAction(data: CreateSystemLogDto) {
        try {
            await this.prisma.systemLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValue: data.oldValue ?? Prisma.JsonNull,
                    newValue: data.newValue ?? Prisma.JsonNull,
                    metadata: data.metadata ?? Prisma.JsonNull,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    status: data.status || 'SUCCESS',
                    errorMessage: data.errorMessage,
                },
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Failed to save audit log: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Failed to save audit log: ${String(error)}`);
            }
        }
    }

    async getLogs(
        page = 1,
        limit = 50,
        filter?: { action?: string; userId?: string; entityType?: string },
    ) {
        const where: Prisma.SystemLogWhereInput = {};
        if (filter?.action) where.action = filter.action;
        if (filter?.userId) where.userId = filter.userId;
        if (filter?.entityType) where.entityType = filter.entityType;

        const [total, data] = await Promise.all([
            this.prisma.systemLog.count({ where }),
            this.prisma.systemLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            profile: {
                                select: { firstName: true, lastName: true },
                            },
                        },
                    },
                },
            }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getLogDetail(id: string) {
        const log = await this.prisma.systemLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatar: true },
                        },
                    },
                },
            },
        });

        if (!log) {
            throw new NotFoundException('Log not found');
        }

        const diffTable = this.generateDiffTable(log.oldValue, log.newValue);

        return {
            ...log,
            diffTable,
            parsedMetadata: log.metadata ? (log.metadata as Record<string, unknown>) : null,
        };
    }

    private generateDiffTable(oldValue: unknown, newValue: unknown): DiffItem[] {
        const diffItems: DiffItem[] = [];

        // Type guard: ensure values are objects
        const isOldValueObject =
            oldValue && typeof oldValue === 'object' && !Array.isArray(oldValue);
        const isNewValueObject =
            newValue && typeof newValue === 'object' && !Array.isArray(newValue);

        // Nếu không có old value (CREATE)
        if (!oldValue && isNewValueObject) {
            Object.keys(newValue as Record<string, unknown>).forEach(key => {
                if (!this.shouldSkipField(key)) {
                    diffItems.push({
                        field: key,
                        oldValue: null,
                        newValue: this.formatValue((newValue as Record<string, unknown>)[key]),
                        type: 'added',
                    });
                }
            });
            return diffItems;
        }

        // Nếu không có new value (DELETE)
        if (isOldValueObject && !newValue) {
            Object.keys(oldValue as Record<string, unknown>).forEach(key => {
                if (!this.shouldSkipField(key)) {
                    diffItems.push({
                        field: key,
                        oldValue: this.formatValue((oldValue as Record<string, unknown>)[key]),
                        newValue: null,
                        type: 'removed',
                    });
                }
            });
            return diffItems;
        }

        // So sánh UPDATE
        if (isOldValueObject && isNewValueObject) {
            const oldObj = oldValue as Record<string, unknown>;
            const newObj = newValue as Record<string, unknown>;
            const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

            allKeys.forEach(key => {
                if (this.shouldSkipField(key)) return;

                const oldVal = oldObj[key];
                const newVal = newObj[key];

                // So sánh giá trị
                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                    let type: 'added' | 'modified' | 'removed';

                    if (oldVal === undefined || oldVal === null) {
                        type = 'added';
                    } else if (newVal === undefined || newVal === null) {
                        type = 'removed';
                    } else {
                        type = 'modified';
                    }

                    diffItems.push({
                        field: key,
                        oldValue: this.formatValue(oldVal),
                        newValue: this.formatValue(newVal),
                        type,
                    });
                }
            });
        }

        return diffItems;
    }

    private shouldSkipField(field: string): boolean {
        const skipFields = ['createdAt', 'updatedAt', 'deletedAt', 'passwordHash', 'password'];
        return skipFields.includes(field);
    }

    private formatValue(value: unknown): unknown {
        if (value === null || value === undefined) {
            return null;
        }

        // Array
        if (Array.isArray(value)) {
            return value;
        }

        // Object
        if (typeof value === 'object') {
            return value;
        }

        // Primitive
        return value;
    }
}
