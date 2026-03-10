import api from '@/libs/axios';

export interface SystemLog {
    id: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
    createdAt: string;
    user?: {
        email: string;
        profile?: {
            firstName: string;
            lastName: string;
        };
    };
}

export interface GetSystemLogsParams {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    entityType?: string;
}

export const systemLogsService = {
    getLogs: async (params?: GetSystemLogsParams) => {
        const response = await api.get('/system-logs', { params });
        return response;
    },
};
