export interface VnWard {
    id: string;
    name: string;
}

export interface VnDistrict {
    id: string;
    name: string;
    wards: VnWard[];
}

export interface VnProvince {
    id: string;
    name: string;
    districts: VnDistrict[];
}

export const VIETNAM_ADMIN_UNITS: VnProvince[] = [
    {
        id: 'hn',
        name: 'Hà Nội',
        districts: [
            {
                id: 'hn-badinh',
                name: 'Quận Ba Đình',
                wards: [
                    { id: 'hn-badinh-db', name: 'Phường Điện Biên' },
                    { id: 'hn-badinh-gv', name: 'Phường Giảng Võ' },
                    { id: 'hn-badinh-td', name: 'Phường Thành Công' },
                ],
            },
            {
                id: 'hn-hoankiem',
                name: 'Quận Hoàn Kiếm',
                wards: [
                    { id: 'hn-hk-cd', name: 'Phường Chương Dương' },
                    { id: 'hn-hk-cn', name: 'Phường Cửa Nam' },
                    { id: 'hn-hk-hb', name: 'Phường Hàng Bạc' },
                ],
            },
            {
                id: 'hn-caugiay',
                name: 'Quận Cầu Giấy',
                wards: [
                    { id: 'hn-cg-dich', name: 'Phường Dịch Vọng' },
                    { id: 'hn-cg-nghia', name: 'Phường Nghĩa Đô' },
                ],
            },
            {
                id: 'hn-quocoai',
                name: 'Huyện Quốc Oai',
                wards: [
                    { id: 'hn-qo-tanhoa', name: 'Xã Tân Hòa' },
                    { id: 'hn-qo-tt', name: 'Thị trấn Quốc Oai' },
                ],
            },
        ],
    },
    {
        id: 'hcm',
        name: 'TP. Hồ Chí Minh',
        districts: [
            {
                id: 'hcm-q1',
                name: 'Quận 1',
                wards: [
                    { id: 'hcm-q1-bn', name: 'Phường Bến Nghé' },
                    { id: 'hcm-q1-dk', name: 'Phường Đa Kao' },
                    { id: 'hcm-q1-td', name: 'Phường Tân Định' },
                ],
            },
            {
                id: 'hcm-q3',
                name: 'Quận 3',
                wards: [
                    { id: 'hcm-q3-p11', name: 'Phường 11' },
                    { id: 'hcm-q3-p12', name: 'Phường 12' },
                ],
            },
            {
                id: 'hcm-thuduc',
                name: 'TP. Thủ Đức',
                wards: [
                    { id: 'hcm-td-lt', name: 'Phường Linh Trung' },
                    { id: 'hcm-td-tp', name: 'Phường Tam Phú' },
                ],
            },
        ],
    },
    {
        id: 'dn',
        name: 'Đà Nẵng',
        districts: [
            {
                id: 'dn-haichau',
                name: 'Quận Hải Châu',
                wards: [
                    { id: 'dn-hc-tt', name: 'Phường Thạch Thang' },
                    { id: 'dn-hc-th', name: 'Phường Thuận Phước' },
                ],
            },
            {
                id: 'dn-nguhanhson',
                name: 'Quận Ngũ Hành Sơn',
                wards: [
                    { id: 'dn-nhs-ma', name: 'Phường Mỹ An' },
                    { id: 'dn-nhs-khe', name: 'Phường Khuê Mỹ' },
                ],
            },
        ],
    },
];

export function findProvinceByCityName(city: string): VnProvince | undefined {
    return VIETNAM_ADMIN_UNITS.find(p => p.name === city.trim());
}

export function findDistrict(
    provinceName: string,
    districtName: string,
): VnDistrict | undefined {
    const p = findProvinceByCityName(provinceName);
    return p?.districts.find(d => d.name === districtName.trim());
}
