
export interface Address {
    id: string;
    userId: string;
    label: string | null;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressDto {
    label?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    ward: string;
    district: string;
    city: string;
    isDefault?: boolean;
}

export type UpdateAddressDto = Partial<CreateAddressDto>;
