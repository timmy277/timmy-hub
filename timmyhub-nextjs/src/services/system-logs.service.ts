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

export interface DiffItem {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    type: 'added' | 'modified' | 'removed';
}

export interface SystemLogDetail extends SystemLog {
    oldValue?: unknown;
    newValue?: unknown;
    diffTable: DiffItem[];
    parsedMetadata?: Record<string, unknown>;
    user?: {
        id: string;
        email: string;
        profile?: {
            firstName: string;
            lastName: string;
            avatar?: string;
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

    getLogDetail: async (id: string): Promise<SystemLogDetail> => {
        const response = await api.get(`/system-logs/${id}`);
        return response.data;
    },
};
