import { UserRole } from './enums';

export interface CreateUserInput {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    phoneNumber?: string;
    avatar?: string;
    isActive?: boolean;
}
