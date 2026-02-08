export interface Device {
    id: string;
    name: string;
}

export interface User {
    id: string;
    email: string;
    role: string;
}

export interface LoginData {
    accessToken: string;
    refreshToken: string;
    user: User;
    device: Device;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface LoginInput {
    email: string;
    password: string;
}
