export interface ApiErrorResponse {
    success: boolean;
    message: string;
    error?: unknown;
    timestamp: string;
    statusCode?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}
