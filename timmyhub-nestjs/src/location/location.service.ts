import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    CreateProvinceDto,
    CreateDistrictDto,
    CreateWardDto,
    UpdateProvinceDto,
    UpdateDistrictDto,
    UpdateWardDto,
    BulkSeedLocationDto,
    ProvinceDto,
    DistrictDto,
    WardDto,
} from './dto/location.dto';

// Embedded Vietnam location data (HN, HCM, Da Nang, Can Tho)
const EMBEDDED_LOCATIONS: BulkSeedLocationDto = {
    provinces: [
        { code: '01', name: 'Thành phố Hà Nội', slug: 'thanh-pho-ha-noi' },
        { code: '79', name: 'Thành phố Hồ Chí Minh', slug: 'thanh-pho-ho-chi-minh' },
        { code: '48', name: 'Thành phố Đà Nẵng', slug: 'thanh-pho-da-nang' },
        { code: '92', name: 'Thành phố Cần Thơ', slug: 'thanh-pho-can-tho' },
    ],
    districts: [
        // Hanoi districts
        { code: '001', provinceCode: '01', name: 'Quận Ba Đình', slug: 'quan-ba-dinh' },
        { code: '002', provinceCode: '01', name: 'Quận Hoàn Kiếm', slug: 'quan-hoan-kiem' },
        { code: '003', provinceCode: '01', name: 'Quận Tây Hồ', slug: 'quan-tay-ho' },
        { code: '004', provinceCode: '01', name: 'Quận Long Biên', slug: 'quan-long-bien' },
        { code: '005', provinceCode: '01', name: 'Quận Cầu Giấy', slug: 'quan-cau-giay' },
        { code: '006', provinceCode: '01', name: 'Quận Đống Đa', slug: 'quan-dong-da' },
        { code: '007', provinceCode: '01', name: 'Quận Hai Bà Trưng', slug: 'quan-hai-ba-trung' },
        { code: '008', provinceCode: '01', name: 'Quận Hoàng Mai', slug: 'quan-hoang-mai' },
        { code: '009', provinceCode: '01', name: 'Quận Thanh Xuân', slug: 'quan-thanh-xuan' },
        // HCM districts
        { code: '760', provinceCode: '79', name: 'Quận 1', slug: 'quan-1' },
        { code: '761', provinceCode: '79', name: 'Quận 3', slug: 'quan-3' },
        { code: '762', provinceCode: '79', name: 'Quận 4', slug: 'quan-4' },
        { code: '763', provinceCode: '79', name: 'Quận 5', slug: 'quan-5' },
        { code: '764', provinceCode: '79', name: 'Quận 6', slug: 'quan-6' },
        { code: '765', provinceCode: '79', name: 'Quận 8', slug: 'quan-8' },
        { code: '769', provinceCode: '79', name: 'Quận Bình Thạnh', slug: 'quan-binh-thanh' },
        { code: '770', provinceCode: '79', name: 'Quận Gò Vấp', slug: 'quan-go-vap' },
        { code: '771', provinceCode: '79', name: 'Quận Phú Nhuận', slug: 'quan-phu-nhuan' },
        { code: '774', provinceCode: '79', name: 'Quận Tân Bình', slug: 'quan-tan-binh' },
        { code: '775', provinceCode: '79', name: 'Quận Tân Phú', slug: 'quan-tan-phu' },
        { code: '778', provinceCode: '79', name: 'Quận 7', slug: 'quan-7' },
        // Da Nang districts
        { code: '490', provinceCode: '48', name: 'Quận Liên Chiểu', slug: 'quan-lien-chieu' },
        { code: '491', provinceCode: '48', name: 'Quận Thanh Khê', slug: 'quan-thanh-khe' },
        { code: '492', provinceCode: '48', name: 'Quận Hải Châu', slug: 'quan-hai-chau' },
        { code: '493', provinceCode: '48', name: 'Quận Sơn Trà', slug: 'quan-son-tra' },
        { code: '494', provinceCode: '48', name: 'Quận Ngũ Hành Sơn', slug: 'quan-ngu-hanh-son' },
        { code: '495', provinceCode: '48', name: 'Huyện Hòa Vang', slug: 'huyen-hoa-vang' },
        // Can Tho districts
        { code: '916', provinceCode: '92', name: 'Quận Ninh Kiều', slug: 'quan-ninh-kieu' },
        { code: '917', provinceCode: '92', name: 'Quận Bình Thuỷ', slug: 'quan-binh-thuy' },
        { code: '918', provinceCode: '92', name: 'Quận Cái Răng', slug: 'quan-cai-rang' },
        { code: '924', provinceCode: '92', name: 'Quận Thốt Nốt', slug: 'quan-thot-not' },
        { code: '925', provinceCode: '92', name: 'Huyện Phong Điền', slug: 'huyen-phong-dien' },
        { code: '926', provinceCode: '92', name: 'Huyện Cờ Đỏ', slug: 'huyen-co-do' },
    ],
    wards: [
        // Ba Dinh wards
        { code: '00001', districtCode: '001', name: 'Phường Phúc Xá', slug: 'phuong-phuc-xa' },
        { code: '00002', districtCode: '001', name: 'Phường Trúc Bạch', slug: 'phuong-truc-bach' },
        { code: '00003', districtCode: '001', name: 'Phường Vĩnh Phúc', slug: 'phuong-vinh-phuc' },
        { code: '00004', districtCode: '001', name: 'Phường Cống Vị', slug: 'phuong-cong-vi' },
        { code: '00005', districtCode: '001', name: 'Phường Liễu Giai', slug: 'phuong-lieu-giai' },
        {
            code: '00006',
            districtCode: '001',
            name: 'Phường Nguyễn Trung Trực',
            slug: 'phuong-nguyen-trung-truc',
        },
        {
            code: '00007',
            districtCode: '001',
            name: 'Phường Quán Thánh',
            slug: 'phuong-quan-thanh',
        },
        {
            code: '00008',
            districtCode: '001',
            name: 'Phường Phú Thượng',
            slug: 'phuong-phu-thuong',
        },
        { code: '00009', districtCode: '001', name: 'Phường Tứ Liên', slug: 'phuong-tu-lien' },
        { code: '00010', districtCode: '001', name: 'Phường Xuân La', slug: 'phuong-xuan-la' },
        { code: '00011', districtCode: '001', name: 'Phường Yên Phụ', slug: 'phuong-yen-phu' },
        { code: '00012', districtCode: '001', name: 'Phường Thụy Khuê', slug: 'phuong-thuy-khue' },
        // Hoan Kiem wards
        {
            code: '00013',
            districtCode: '002',
            name: 'Phường Phan Chu Trinh',
            slug: 'phuong-phan-chu-trinh',
        },
        { code: '00014', districtCode: '002', name: 'Phường Hàng Bạc', slug: 'phuong-hang-bac' },
        { code: '00015', districtCode: '002', name: 'Phường Hàng Gai', slug: 'phuong-hang-gai' },
        { code: '00016', districtCode: '002', name: 'Phường Cửa Đông', slug: 'phuong-cua-dong' },
        {
            code: '00017',
            districtCode: '002',
            name: 'Phường Lý Thái Tổ',
            slug: 'phuong-ly-thai-to',
        },
        { code: '00018', districtCode: '002', name: 'Phường Hàng Bài', slug: 'phuong-hang-bai' },
        {
            code: '00019',
            districtCode: '002',
            name: 'Phường Hàng Trống',
            slug: 'phuong-hang-trong',
        },
        { code: '00020', districtCode: '002', name: 'Phường Hàng Mã', slug: 'phuong-hang-ma' },
        {
            code: '00021',
            districtCode: '002',
            name: 'Phường Chương Dương',
            slug: 'phuong-chuong-duong',
        },
        {
            code: '00022',
            districtCode: '002',
            name: 'Phường Tràng Tiền',
            slug: 'phuong-trang-tien',
        },
        {
            code: '00023',
            districtCode: '002',
            name: 'Phường Trần Hưng Đạo',
            slug: 'phuong-tran-hung-dao',
        },
        // Tay Ho wards
        {
            code: '00024',
            districtCode: '003',
            name: 'Phường Phú Thượng',
            slug: 'phuong-phu-thuong',
        },
        { code: '00025', districtCode: '003', name: 'Phường Nhật Tân', slug: 'phuong-nhat-tan' },
        { code: '00026', districtCode: '003', name: 'Phường Tứ Liên', slug: 'phuong-tu-lien' },
        { code: '00027', districtCode: '003', name: 'Phường Quảng An', slug: 'phuong-quang-an' },
        { code: '00028', districtCode: '003', name: 'Phường Xuân La', slug: 'phuong-xuan-la' },
        { code: '00029', districtCode: '003', name: 'Phường Bưởi', slug: 'phuong-buoi' },
        { code: '00030', districtCode: '003', name: 'Phường Thụy Khuê', slug: 'phuong-thuy-khue' },
        // Cau Giay wards
        { code: '00031', districtCode: '005', name: 'Phường Nghĩa Đô', slug: 'phuong-nghia-do' },
        { code: '00032', districtCode: '005', name: 'Phường Nghĩa Tân', slug: 'phuong-nghia-tan' },
        { code: '00033', districtCode: '005', name: 'Phường Mai Dịch', slug: 'phuong-mai-dich' },
        { code: '00034', districtCode: '005', name: 'Phường Dịch Vọng', slug: 'phuong-dich-vong' },
        {
            code: '00035',
            districtCode: '005',
            name: 'Phường Dịch Vọng Hậu',
            slug: 'phuong-dich-vong-hau',
        },
        { code: '00036', districtCode: '005', name: 'Phường Trung Hoà', slug: 'phuong-trung-hoa' },
        { code: '00037', districtCode: '005', name: 'Phường Yên Hoà', slug: 'phuong-yen-hoa' },
        { code: '00038', districtCode: '005', name: 'Phường Quan Hoa', slug: 'phuong-quan-hoa' },
        // Dong Da wards
        { code: '00039', districtCode: '006', name: 'Phường Cát Linh', slug: 'phuong-cat-linh' },
        { code: '00040', districtCode: '006', name: 'Phường Văn Miếu', slug: 'phuong-van-mieu' },
        {
            code: '00041',
            districtCode: '006',
            name: 'Phường Quốc Tử Giám',
            slug: 'phuong-quoc-tu-giam',
        },
        {
            code: '00042',
            districtCode: '006',
            name: 'Phường Láng Thượng',
            slug: 'phuong-lang-thuong',
        },
        { code: '00043', districtCode: '006', name: 'Phường Nam Đồng', slug: 'phuong-nam-dong' },
        {
            code: '00044',
            districtCode: '006',
            name: 'Phường Trung Liệt',
            slug: 'phuong-trung-liet',
        },
        {
            code: '00045',
            districtCode: '006',
            name: 'Phường Phương Liên',
            slug: 'phuong-phuong-lien',
        },
        {
            code: '00046',
            districtCode: '006',
            name: 'Phường Thịnh Quang',
            slug: 'phuong-thinh-quang',
        },
        { code: '00047', districtCode: '006', name: 'Phường Đống Đa', slug: 'phuong-dong-da' },
        { code: '00048', districtCode: '006', name: 'Phường Láng Hạ', slug: 'phuong-lang-ha' },
        { code: '00049', districtCode: '006', name: 'Phường Ô Chợ Dừa', slug: 'phuong-o-cho-dua' },
        // Hai Ba Trung wards
        { code: '00050', districtCode: '007', name: 'Phường Nguyễn Du', slug: 'phuong-nguyen-du' },
        { code: '00051', districtCode: '007', name: 'Phường Bạch Đằng', slug: 'phuong-bach-dang' },
        {
            code: '00052',
            districtCode: '007',
            name: 'Phường Phạm Đình Hổ',
            slug: 'phuong-pham-dinh-ho',
        },
        {
            code: '00053',
            districtCode: '007',
            name: 'Phường Lê Đại Hành',
            slug: 'phuong-le-dai-hanh',
        },
        { code: '00054', districtCode: '007', name: 'Phường Đồng Nhân', slug: 'phuong-dong-nhan' },
        { code: '00055', districtCode: '007', name: 'Phường Phố Huế', slug: 'phuong-pho-hue' },
        { code: '00056', districtCode: '007', name: 'Phường Điện Biên', slug: 'phuong-dien-bien' },
        { code: '00057', districtCode: '007', name: 'Phường Bách Khoa', slug: 'phuong-bach-khoa' },
        {
            code: '00058',
            districtCode: '007',
            name: 'Phường Thanh Nhàn',
            slug: 'phuong-thanh-nhan',
        },
        { code: '00059', districtCode: '007', name: 'Phường Quỳnh Lôi', slug: 'phuong-quynh-loi' },
        { code: '00060', districtCode: '007', name: 'Phường Quỳnh Mai', slug: 'phuong-quynh-mai' },
        { code: '00061', districtCode: '007', name: 'Phường Minh Khai', slug: 'phuong-minh-khai' },
        {
            code: '00062',
            districtCode: '007',
            name: 'Phường Trương Định',
            slug: 'phuong-truong-dinh',
        },
        // Hoang Mai wards
        { code: '00063', districtCode: '008', name: 'Phường Trần Phú', slug: 'phuong-tran-phu' },
        {
            code: '00064',
            districtCode: '008',
            name: 'Phường Hoàng Văn Thụ',
            slug: 'phuong-hoang-van-thu',
        },
        {
            code: '00065',
            districtCode: '008',
            name: 'Phường Quang Trung',
            slug: 'phuong-quang-trung',
        },
        {
            code: '00066',
            districtCode: '008',
            name: 'Phường Trương Định',
            slug: 'phuong-truong-dinh',
        },
        { code: '00067', districtCode: '008', name: 'Phường Định Công', slug: 'phuong-dinh-cong' },
        {
            code: '00068',
            districtCode: '008',
            name: 'Phường Thịnh Liệt',
            slug: 'phuong-thinh-liet',
        },
        {
            code: '00069',
            districtCode: '008',
            name: 'Phường Hoàng Liệt',
            slug: 'phuong-hoang-liet',
        },
        { code: '00070', districtCode: '008', name: 'Phường Yên Sở', slug: 'phuong-yen-so' },
        { code: '00071', districtCode: '008', name: 'Phường Sở Thượng', slug: 'phuong-so-thuong' },
        { code: '00072', districtCode: '008', name: 'Phường Dương Nội', slug: 'phuong-duong-noi' },
        // Thanh Xuan wards
        {
            code: '00073',
            districtCode: '009',
            name: 'Phường Nhân Chính',
            slug: 'phuong-nhan-chinh',
        },
        {
            code: '00074',
            districtCode: '009',
            name: 'Phường Thượng Đình',
            slug: 'phuong-thuong-dinh',
        },
        {
            code: '00075',
            districtCode: '009',
            name: 'Phường Khương Trung',
            slug: 'phuong-khuong-trung',
        },
        {
            code: '00076',
            districtCode: '009',
            name: 'Phường Thanh Xuân Trung',
            slug: 'phuong-thanh-xuan-trung',
        },
        {
            code: '00077',
            districtCode: '009',
            name: 'Phường Khương Mai',
            slug: 'phuong-khuong-mai',
        },
        {
            code: '00078',
            districtCode: '009',
            name: 'Phường Phương Liệt',
            slug: 'phuong-phuong-liet',
        },
        { code: '00079', districtCode: '009', name: 'Phường Hạ Đình', slug: 'phuong-ha-dinh' },
        {
            code: '00080',
            districtCode: '009',
            name: 'Phường Thanh Xuân Bắc',
            slug: 'phuong-thanh-xuan-bac',
        },
        {
            code: '00081',
            districtCode: '009',
            name: 'Phường Thanh Xuân Nam',
            slug: 'phuong-thanh-xuan-nam',
        },
        { code: '00082', districtCode: '009', name: 'Phường Kim Giang', slug: 'phuong-kim-giang' },
        // HCM - Quan 1 wards
        { code: '00083', districtCode: '760', name: 'Phường Tân Định', slug: 'phuong-tan-dinh' },
        { code: '00084', districtCode: '760', name: 'Phường Đa Kao', slug: 'phuong-da-kao' },
        { code: '00085', districtCode: '760', name: 'Phường Bến Nghé', slug: 'phuong-ben-nghe' },
        { code: '00086', districtCode: '760', name: 'Phường Bến Thành', slug: 'phuong-ben-thanh' },
        {
            code: '00087',
            districtCode: '760',
            name: 'Phường Nguyễn Thái Bình',
            slug: 'phuong-nguyen-thai-binh',
        },
        {
            code: '00088',
            districtCode: '760',
            name: 'Phường Phạm Ngũ Lão',
            slug: 'phuong-pham-ngu-lao',
        },
        {
            code: '00089',
            districtCode: '760',
            name: 'Phường Cầu Ông Lãnh',
            slug: 'phuong-cau-ong-lanh',
        },
        { code: '00090', districtCode: '760', name: 'Phường Cô Giang', slug: 'phuong-co-giang' },
        {
            code: '00091',
            districtCode: '760',
            name: 'Phường Nguyễn Cư Trinh',
            slug: 'phuong-nguyen-cu-trinh',
        },
        { code: '00092', districtCode: '760', name: 'Phường Cầu Kho', slug: 'phuong-cau-kho' },
        // HCM - Quan 3 wards
        {
            code: '00093',
            districtCode: '761',
            name: 'Phường Phạm Ngũ Lão',
            slug: 'phuong-pham-ngu-lao',
        },
        {
            code: '00094',
            districtCode: '761',
            name: 'Phường Nguyễn Cư Trinh',
            slug: 'phuong-nguyen-cu-trinh',
        },
        {
            code: '00095',
            districtCode: '761',
            name: 'Phường Nguyễn Thái Bình',
            slug: 'phuong-nguyen-thai-binh',
        },
        { code: '00096', districtCode: '761', name: 'Phường Bến Nghé', slug: 'phuong-ben-nghe' },
        { code: '00097', districtCode: '761', name: 'Phường Đa Kao', slug: 'phuong-da-kao' },
        { code: '00098', districtCode: '761', name: 'Phường Tân Định', slug: 'phuong-tan-dinh' },
        { code: '00099', districtCode: '761', name: 'Phường Bến Thành', slug: 'phuong-ben-thanh' },
        {
            code: '00100',
            districtCode: '761',
            name: 'Phường Võ Thị Sáu',
            slug: 'phuong-vo-thi-sau',
        },
        { code: '00101', districtCode: '761', name: 'Phường 6', slug: 'phuong-6' },
        { code: '00102', districtCode: '761', name: 'Phường 7', slug: 'phuong-7' },
        // HCM - Quan 7 wards
        { code: '00103', districtCode: '778', name: 'Phường Bến Nghé', slug: 'phuong-ben-nghe' },
        { code: '00104', districtCode: '778', name: 'Phường Đa Kao', slug: 'phuong-da-kao' },
        { code: '00105', districtCode: '778', name: 'Phường Tân Định', slug: 'phuong-tan-dinh' },
        {
            code: '00106',
            districtCode: '778',
            name: 'Phường Nguyễn Cư Trinh',
            slug: 'phuong-nguyen-cu-trinh',
        },
        { code: '00107', districtCode: '778', name: 'Phường Cầu Kho', slug: 'phuong-cau-kho' },
        { code: '00108', districtCode: '778', name: 'Phường Cô Giang', slug: 'phuong-co-giang' },
        {
            code: '00109',
            districtCode: '778',
            name: 'Phường Phạm Ngũ Lão',
            slug: 'phuong-pham-ngu-lao',
        },
        { code: '00110', districtCode: '778', name: 'Phường 8', slug: 'phuong-8' },
        { code: '00111', districtCode: '778', name: 'Phường 9', slug: 'phuong-9' },
        { code: '00112', districtCode: '778', name: 'Phường 10', slug: 'phuong-10' },
        { code: '00113', districtCode: '778', name: 'Phường 11', slug: 'phuong-11' },
        { code: '00114', districtCode: '778', name: 'Phường 12', slug: 'phuong-12' },
        { code: '00115', districtCode: '778', name: 'Phường 13', slug: 'phuong-13' },
        { code: '00116', districtCode: '778', name: 'Phường 14', slug: 'phuong-14' },
        { code: '00117', districtCode: '778', name: 'Phường 15', slug: 'phuong-15' },
        { code: '00118', districtCode: '778', name: 'Phường 16', slug: 'phuong-16' },
        // HCM - Tan Binh wards
        { code: '00119', districtCode: '774', name: 'Phường 1', slug: 'phuong-1' },
        { code: '00120', districtCode: '774', name: 'Phường 2', slug: 'phuong-2' },
        { code: '00121', districtCode: '774', name: 'Phường 3', slug: 'phuong-3' },
        { code: '00122', districtCode: '774', name: 'Phường 4', slug: 'phuong-4' },
        { code: '00123', districtCode: '774', name: 'Phường 5', slug: 'phuong-5' },
        { code: '00124', districtCode: '774', name: 'Phường 6', slug: 'phuong-6' },
        { code: '00125', districtCode: '774', name: 'Phường 7', slug: 'phuong-7' },
        { code: '00126', districtCode: '774', name: 'Phường 8', slug: 'phuong-8' },
        { code: '00127', districtCode: '774', name: 'Phường 9', slug: 'phuong-9' },
        { code: '00128', districtCode: '774', name: 'Phường 10', slug: 'phuong-10' },
        { code: '00129', districtCode: '774', name: 'Phường 11', slug: 'phuong-11' },
        { code: '00130', districtCode: '774', name: 'Phường 12', slug: 'phuong-12' },
        { code: '00131', districtCode: '774', name: 'Phường 13', slug: 'phuong-13' },
        { code: '00132', districtCode: '774', name: 'Phường 14', slug: 'phuong-14' },
        { code: '00133', districtCode: '774', name: 'Phường 15', slug: 'phuong-15' },
        // Da Nang - Hai Chau wards
        {
            code: '00134',
            districtCode: '492',
            name: 'Phường Thanh Bình',
            slug: 'phuong-thanh-binh',
        },
        {
            code: '00135',
            districtCode: '492',
            name: 'Phường Thuận Phước',
            slug: 'phuong-thuan-phuoc',
        },
        {
            code: '00136',
            districtCode: '492',
            name: 'Phường Thạch Thang',
            slug: 'phuong-thach-thang',
        },
        {
            code: '00137',
            districtCode: '492',
            name: 'Phường Hải Châu 1',
            slug: 'phuong-hai-chau-1',
        },
        {
            code: '00138',
            districtCode: '492',
            name: 'Phường Hải Châu 2',
            slug: 'phuong-hai-chau-2',
        },
        { code: '00139', districtCode: '492', name: 'Phường Bình Hiên', slug: 'phuong-binh-hien' },
        {
            code: '00140',
            districtCode: '492',
            name: 'Phường Bình Thuận',
            slug: 'phuong-binh-thuan',
        },
        {
            code: '00141',
            districtCode: '492',
            name: 'Phường Hòa Cường Bắc',
            slug: 'phuong-hoa-cuong-bac',
        },
        {
            code: '00142',
            districtCode: '492',
            name: 'Phường Hòa Cường Nam',
            slug: 'phuong-hoa-cuong-nam',
        },
        {
            code: '00143',
            districtCode: '492',
            name: 'Phường Khuê Trung',
            slug: 'phuong-khue-trung',
        },
        // Can Tho - Ninh Kieu wards
        { code: '00144', districtCode: '916', name: 'Phường Cái Khế', slug: 'phuong-cai-khe' },
        { code: '00145', districtCode: '916', name: 'Phường An Đông', slug: 'phuong-an-dong' },
        { code: '00146', districtCode: '916', name: 'Phường An Cư', slug: 'phuong-an-cu' },
        { code: '00147', districtCode: '916', name: 'Phường Tân An', slug: 'phuong-tan-an' },
        { code: '00148', districtCode: '916', name: 'Phường Thới Bình', slug: 'phuong-thoi-binh' },
        { code: '00149', districtCode: '916', name: 'Phường An Nghiệp', slug: 'phuong-an-nghiep' },
        {
            code: '00150',
            districtCode: '916',
            name: 'Phường Xuân Khánh',
            slug: 'phuong-xuan-khanh',
        },
        { code: '00151', districtCode: '916', name: 'Phường Hưng Lợi', slug: 'phuong-hung-loi' },
        {
            code: '00152',
            districtCode: '916',
            name: 'Phường Thường Thạnh',
            slug: 'phuong-thuong-thanh',
        },
        { code: '00153', districtCode: '916', name: 'Phường Phú Thứ', slug: 'phuong-phu-thu' },
    ],
};

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ===== Public: Get all provinces =====
    getProvinces(): Promise<ProvinceDto[]> {
        return this.prisma.province.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, code: true, name: true, slug: true },
        });
    }

    // ===== Admin: Get all districts =====
    getAllDistricts(): Promise<DistrictDto[]> {
        return this.prisma.district.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, code: true, provinceCode: true, name: true, slug: true },
        });
    }

    // ===== Admin: Get all wards =====
    getAllWards(): Promise<WardDto[]> {
        return this.prisma.ward.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, code: true, districtCode: true, name: true, slug: true },
        });
    }

    // ===== Public: Get districts by provinceCode =====
    async getDistrictsByProvince(provinceCode: string): Promise<DistrictDto[]> {
        const province = await this.prisma.province.findUnique({
            where: { code: provinceCode },
        });
        if (!province) {
            throw new NotFoundException(`Province with code "${provinceCode}" not found`);
        }

        return this.prisma.district.findMany({
            where: { provinceCode },
            orderBy: { name: 'asc' },
            select: { id: true, code: true, provinceCode: true, name: true, slug: true },
        });
    }

    // ===== Public: Get wards by districtCode =====
    async getWardsByDistrict(districtCode: string): Promise<WardDto[]> {
        const district = await this.prisma.district.findUnique({
            where: { code: districtCode },
        });
        if (!district) {
            throw new NotFoundException(`District with code "${districtCode}" not found`);
        }

        return this.prisma.ward.findMany({
            where: { districtCode },
            orderBy: { name: 'asc' },
            select: { id: true, code: true, districtCode: true, name: true, slug: true },
        });
    }

    // ===== Admin: Seed all locations (bulk upsert) =====
    async seedLocations(
        dto: BulkSeedLocationDto,
    ): Promise<{ provinces: number; districts: number; wards: number }> {
        const { provinces, districts, wards } = dto;

        // Upsert provinces
        await this.prisma.province.deleteMany({});
        await this.prisma.district.deleteMany({});
        await this.prisma.ward.deleteMany({});

        const provinceResults = await Promise.all(
            provinces.map(p =>
                this.prisma.province.upsert({
                    where: { code: p.code },
                    update: { name: p.name, slug: p.slug },
                    create: { code: p.code, name: p.name, slug: p.slug },
                }),
            ),
        );

        const districtResults = await Promise.all(
            districts.map(d =>
                this.prisma.district.upsert({
                    where: { code: d.code },
                    update: { provinceCode: d.provinceCode, name: d.name, slug: d.slug },
                    create: {
                        code: d.code,
                        provinceCode: d.provinceCode,
                        name: d.name,
                        slug: d.slug,
                    },
                }),
            ),
        );

        const wardResults = await Promise.all(
            wards.map(w =>
                this.prisma.ward.upsert({
                    where: { code: w.code },
                    update: { districtCode: w.districtCode, name: w.name, slug: w.slug },
                    create: {
                        code: w.code,
                        districtCode: w.districtCode,
                        name: w.name,
                        slug: w.slug,
                    },
                }),
            ),
        );

        this.logger.log(
            `Seeded ${provinceResults.length} provinces, ${districtResults.length} districts, ${wardResults.length} wards`,
        );

        return {
            provinces: provinceResults.length,
            districts: districtResults.length,
            wards: wardResults.length,
        };
    }

    // ===== Admin: Seed embedded Vietnam data (HN, HCM, Da Nang, Can Tho) =====
    async seedEmbedded(): Promise<{ provinces: number; districts: number; wards: number }> {
        return await this.seedLocations(EMBEDDED_LOCATIONS);
    }

    // ===== Admin: CRUD Province =====
    createProvince(dto: CreateProvinceDto) {
        return this.prisma.province.create({ data: dto });
    }

    async getProvinceByCode(code: string) {
        const province = await this.prisma.province.findUnique({
            where: { code },
            include: { districts: { orderBy: { name: 'asc' } } },
        });
        if (!province) throw new NotFoundException(`Province "${code}" not found`);
        return province;
    }

    async updateProvince(code: string, dto: UpdateProvinceDto) {
        await this.getProvinceByCode(code);
        return this.prisma.province.update({ where: { code }, data: dto });
    }

    async deleteProvince(code: string) {
        await this.getProvinceByCode(code);
        return this.prisma.province.delete({ where: { code } });
    }

    // ===== Admin: CRUD District =====
    async createDistrict(dto: CreateDistrictDto) {
        const province = await this.prisma.province.findUnique({
            where: { code: dto.provinceCode },
        });
        if (!province)
            throw new BadRequestException(`Province code "${dto.provinceCode}" does not exist`);

        return this.prisma.district.create({ data: dto });
    }

    async getDistrictByCode(code: string) {
        const district = await this.prisma.district.findUnique({
            where: { code },
            include: { province: true, wards: { orderBy: { name: 'asc' } } },
        });
        if (!district) throw new NotFoundException(`District "${code}" not found`);
        return district;
    }

    async updateDistrict(code: string, dto: UpdateDistrictDto) {
        await this.getDistrictByCode(code);
        return this.prisma.district.update({ where: { code }, data: dto });
    }

    async deleteDistrict(code: string) {
        await this.getDistrictByCode(code);
        return this.prisma.district.delete({ where: { code } });
    }

    // ===== Admin: CRUD Ward =====
    async createWard(dto: CreateWardDto) {
        const district = await this.prisma.district.findUnique({
            where: { code: dto.districtCode },
        });
        if (!district)
            throw new BadRequestException(`District code "${dto.districtCode}" does not exist`);

        return this.prisma.ward.create({ data: dto });
    }

    async getWardByCode(code: string) {
        const ward = await this.prisma.ward.findUnique({
            where: { code },
            include: { district: { include: { province: true } } },
        });
        if (!ward) throw new NotFoundException(`Ward "${code}" not found`);
        return ward;
    }

    async updateWard(code: string, dto: UpdateWardDto) {
        await this.getWardByCode(code);
        return this.prisma.ward.update({ where: { code }, data: dto });
    }

    async deleteWard(code: string) {
        await this.getWardByCode(code);
        return this.prisma.ward.delete({ where: { code } });
    }
}
