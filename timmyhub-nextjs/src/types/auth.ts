import { UserRole } from './enums';

export interface Device {
    id: string;
    name: string;
}

export interface Profile {
    firstName: string;
    lastName: string;
    displayName?: string | null;
    avatar?: string | null;
}

export interface UserRoleRelation {
    roleId: string;
    role: {
        id: string;
        name: string;
        displayName: string;
    };
}

export interface User {
    id: string;
    email: string;
    phone?: string | null;
    role: UserRole | string;
    isActive: boolean;

    isBanned?: boolean;
    permissions: string[];
    profile?: Profile | null;
    userRoles?: UserRoleRelation[];
    createdAt?: string;
}

export interface LoginData {
    accessToken: string;
    refreshToken: string;
    user: User;
    device: Device;
}

export interface LoginInput {
    email: string;
    password: string;
}
