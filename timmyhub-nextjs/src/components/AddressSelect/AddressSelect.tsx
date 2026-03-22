'use client';

import { useEffect, useState } from 'react';
import { Select, SelectProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { locationService } from '@/services/location.service';
import type { Province, District, Ward } from '@/types/location';

interface AddressSelectProps {
    provinceCode?: string | null;
    districtCode?: string | null;
    wardCode?: string | null;
    provinceValue?: string;
    districtValue?: string;
    wardValue?: string;
    provinceLabel?: string;
    districtLabel?: string;
    wardLabel?: string;
    onProvinceChange?: (code: string | null, name?: string) => void;
    onDistrictChange?: (code: string | null, name?: string) => void;
    onWardChange?: (code: string | null, name?: string) => void;
    disabled?: boolean;
    size?: SelectProps['size'];
    required?: boolean;
    error?: string;
}

export function AddressSelect({
    provinceCode,
    districtCode,
    wardCode,
    provinceLabel,
    districtLabel,
    wardLabel,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    disabled = false,
    size = 'md',
    required = false,
    error,
}: AddressSelectProps) {
    const { t } = useTranslation();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<string | null>(provinceCode ?? null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(districtCode ?? null);
    const [selectedWard, setSelectedWard] = useState<string | null>(wardCode ?? null);

    const [provinceSearch] = useDebouncedValue('', 300);
    const [districtSearch] = useDebouncedValue('', 300);

    // Load provinces on mount
    useEffect(() => {
        locationService.getProvinces().then(setProvinces).catch(console.error);
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (!selectedProvince) return;
        locationService
            .getDistricts(selectedProvince)
            .then(setDistricts)
            .catch(() => setDistricts([]));
    }, [selectedProvince]);

    // Load wards when district changes
    useEffect(() => {
        if (!selectedDistrict) return;
        locationService.getWards(selectedDistrict).then(setWards).catch(() => setWards([]));
    }, [selectedDistrict]);

    const handleProvinceChange = (value: string | null) => {
        setSelectedProvince(value);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        if (value) {
            const province = provinces.find((p) => p.code === value);
            onProvinceChange?.(value, province?.name);
        } else {
            onProvinceChange?.(null);
        }
    };

    const handleDistrictChange = (value: string | null) => {
        setSelectedDistrict(value);
        setSelectedWard(null);
        setWards([]);
        if (value) {
            const district = districts.find((d) => d.code === value);
            onDistrictChange?.(value, district?.name);
        } else {
            onDistrictChange?.(null);
        }
    };

    const handleWardChange = (value: string | null) => {
        setSelectedWard(value);
        if (value) {
            const ward = wards.find((w) => w.code === value);
            onWardChange?.(value, ward?.name);
        } else {
            onWardChange?.(null);
        }
    };

    const provinceOptions = provinces
        .filter((p) => !provinceSearch || p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
        .map((p) => ({ value: p.code, label: p.name }));

    const districtOptions = districts
        .filter((d) => !districtSearch || d.name.toLowerCase().includes(districtSearch.toLowerCase()))
        .map((d) => ({ value: d.code, label: d.name }));

    const wardOptions = wards.map((w) => ({ value: w.code, label: w.name }));

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
                label={provinceLabel ?? t('address.province')}
                placeholder={t('address.selectProvince')}
                data={provinceOptions}
                value={selectedProvince}
                onChange={handleProvinceChange}
                searchable
                clearable
                disabled={disabled}
                size={size}
                required={required}
                error={error && !selectedProvince ? error : undefined}
            />

            <Select
                label={districtLabel ?? t('address.district')}
                placeholder={t('address.selectDistrict')}
                data={districtOptions}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                searchable
                clearable
                disabled={disabled || !selectedProvince}
                size={size}
                required={required}
                error={error && selectedProvince && !selectedDistrict ? error : undefined}
            />

            <Select
                label={wardLabel ?? t('address.ward')}
                placeholder={t('address.selectWard')}
                data={wardOptions}
                value={selectedWard}
                onChange={handleWardChange}
                searchable
                clearable
                disabled={disabled || !selectedDistrict}
                size={size}
                required={required}
                error={error && selectedDistrict && !selectedWard ? error : undefined}
            />
        </div>
    );
}
