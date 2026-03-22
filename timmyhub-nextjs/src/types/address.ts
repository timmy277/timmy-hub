
export interface Address {
    id: string;
    userId: string;
    label: string | null;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    provinceCode: string | null;
    districtCode: string | null;
    wardCode: string | null;
    provinceName: string | null;
    districtName: string | null;
    wardName: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressDto {
    label?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    provinceName?: string;
    districtName?: string;
    wardName?: string;
    isDefault?: boolean;
}

export type UpdateAddressDto = Partial<CreateAddressDto>;
