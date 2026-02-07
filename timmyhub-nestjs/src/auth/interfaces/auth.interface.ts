import { UserRole } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
    sub: string;
    deviceId: string | null;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    deviceId: string | null;
}

export interface UserRequest extends Request {
    user: AuthenticatedUser;
}
