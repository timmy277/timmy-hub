
import { RawRuleOf } from '@casl/ability';
import { AppAbility } from '@/libs/ability';
import { Role } from './rbac';

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    SELLER = 'SELLER',
    BRAND = 'BRAND',
    SHIPPER = 'SHIPPER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface Profile {
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
}

export interface UserSystemRole {
    id: string;
    userId: string;
    roleId: string;
    role: Role;
}

export interface User {
    id: string;
    email: string;
    phone?: string;
    role: UserRole;
    permissions: string[];
    profile?: Profile;
    rules?: RawRuleOf<AppAbility>[];
    userRoles?: UserSystemRole[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Device {
    id: string;
    name: string;
    deviceId?: string;
}

/** Response shape from POST /auth/login */
export interface LoginData {
    user: User;
    device: Device;
    accessToken: string;
    refreshToken: string;
}

export interface LoginInput {
    email: string;
    password: string;
    deviceName?: string;
}

