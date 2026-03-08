import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateSystemLogDto {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    status?: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
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
}
