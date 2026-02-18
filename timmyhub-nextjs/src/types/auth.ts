
import { RawRuleOf } from '@casl/ability';
import { AppAbility } from '@/libs/ability';

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

export interface User {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
    profile?: Profile;
    rules?: RawRuleOf<AppAbility>[];
}

export interface Device {
    id: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
    deviceName?: string;
}

export interface LoginResponse {
    user: User;
    device: Device;
    accessToken: string;
    refreshToken: string;
}
