import { PrismaClient } from '@prisma/client';

const RAW_DATA = [
    {
        code: '01',
        name: 'Thành phố Hà Nội',
        districts: [
            {
                code: '001',
                name: 'Quận Ba Đình',
                wards: [
                    { code: '00001', name: 'Phường Phúc Xá' },
                    { code: '00002', name: 'Phường Trúc Bạch' },
                    { code: '00003', name: 'Phường Vĩnh Phúc' },
                    { code: '00004', name: 'Phường Cống Vị' },
                    { code: '00005', name: 'Phường Liễu Giai' },
                    { code: '00006', name: 'Phường Nguyễn Trung Trực' },
                    { code: '00007', name: 'Phường Quán Thánh' },
                    { code: '00008', name: 'Phường Phú Thượng' },
                    { code: '00009', name: 'Phường Tứ Liên' },
                    { code: '00010', name: 'Phường Xuân La' },
                    { code: '00011', name: 'Phường Yên Phụ' },
                    { code: '00012', name: 'Phường Thụy Khuê' },
                    { code: '00013', name: 'Phường Thượng Thanh' },
                    { code: '00014', name: 'Phường Ngọc Hà' },
                    { code: '00015', name: 'Phường Điện Biên' },
                    { code: '00016', name: 'Phường Đội Cấn' },
                    { code: '00017', name: 'Phường Ngọc Lâm' },
                    { code: '00018', name: 'Phường Liên Hà' },
                ],
            },
            {
                code: '002',
                name: 'Quận Hoàn Kiếm',
                wards: [
                    { code: '00019', name: 'Phường Phan Chu Trinh' },
                    { code: '00020', name: 'Phường Hàng Bạc' },
                    { code: '00021', name: 'Phường Hàng Gai' },
                    { code: '00022', name: 'Phường Cửa Đông' },
                    { code: '00023', name: 'Phường Lý Thái Tổ' },
                    { code: '00024', name: 'Phường Hàng Bài' },
                    { code: '00025', name: 'Phường Hàng Trống' },
                    { code: '00026', name: 'Phường Hàng Mã' },
                    { code: '00027', name: 'Phường Chương Dương' },
                    { code: '00028', name: 'Phường Tràng Tiền' },
                    { code: '00029', name: 'Phường Trần Hưng Đạo' },
                ],
            },
            {
                code: '003',
                name: 'Quận Tây Hồ',
                wards: [
                    { code: '00030', name: 'Phường Phú Thượng' },
                    { code: '00031', name: 'Phường Nhật Tân' },
                    { code: '00032', name: 'Phường Tứ Liên' },
                    { code: '00033', name: 'Phường Quảng An' },
                    { code: '00034', name: 'Phường Xuân La' },
                    { code: '00035', name: 'Phường Bưởi' },
                    { code: '00036', name: 'Phường Thụy Khuê' },
                ],
            },
            {
                code: '004',
                name: 'Quận Long Biên',
                wards: [
                    { code: '00037', name: 'Phường Phúc Đồng' },
                    { code: '00038', name: 'Phường Việt Hưng' },
                    { code: '00039', name: 'Phường Gia Thụy' },
                    { code: '00040', name: 'Phường Ngọc Lâm' },
                    { code: '00041', name: 'Phường Phúc Xá' },
                    { code: '00042', name: 'Phường Thượng Thanh' },
                    { code: '00043', name: 'Phường Cự Khối' },
                    { code: '00044', name: 'Phường Giang Biên' },
                    { code: '00045', name: 'Phường Đức Giang' },
                    { code: '00046', name: 'Phường Bồ Đề' },
                    { code: '00047', name: 'Phường Sài Đồng' },
                    { code: '00048', name: 'Phường Starup' },
                ],
            },
            {
                code: '005',
                name: 'Quận Cầu Giấy',
                wards: [
                    { code: '00049', name: 'Phường Nghĩa Đô' },
                    { code: '00050', name: 'Phường Nghĩa Tân' },
                    { code: '00051', name: 'Phường Mai Dịch' },
                    { code: '00052', name: 'Phường Dịch Vọng' },
                    { code: '00053', name: 'Phường Dịch Vọng Hậu' },
                    { code: '00054', name: 'Phường Trung Hoà' },
                    { code: '00055', name: 'Phường Yên Hoà' },
                    { code: '00056', name: 'Phường Quan Hoa' },
                ],
            },
            {
                code: '006',
                name: 'Quận Đống Đa',
                wards: [
                    { code: '00057', name: 'Phường Cát Linh' },
                    { code: '00058', name: 'Phường Văn Miếu' },
                    { code: '00059', name: 'Phường Quốc Tử Giám' },
                    { code: '00060', name: 'Phường Láng Thượng' },
                    { code: '00061', name: 'Phường Nam Đồng' },
                    { code: '00062', name: 'Phường Trung Liệt' },
                    { code: '00063', name: 'Phường Phương Liên' },
                    { code: '00064', name: 'Phường Thịnh Quang' },
                    { code: '00065', name: 'Phường Đống Đa' },
                    { code: '00066', name: 'Phường Láng Hạ' },
                    { code: '00067', name: 'Phường Ô Chợ Dừa' },
                ],
            },
            {
                code: '007',
                name: 'Quận Hai Bà Trưng',
                wards: [
                    { code: '00068', name: 'Phường Nguyễn Du' },
                    { code: '00069', name: 'Phường Bạch Đằng' },
                    { code: '00070', name: 'Phường Phạm Đình Hổ' },
                    { code: '00071', name: 'Phường Lê Đại Hành' },
                    { code: '00072', name: 'Phường Đồng Nhân' },
                    { code: '00073', name: 'Phường Phố Huế' },
                    { code: '00074', name: 'Phường Điện Biên' },
                    { code: '00075', name: 'Phường Bách Khoa' },
                    { code: '00076', name: 'Phường Thanh Nhàn' },
                    { code: '00077', name: 'Phường Quỳnh Lôi' },
                    { code: '00078', name: 'Phường Quỳnh Mai' },
                    { code: '00079', name: 'Phường Minh Khai' },
                    { code: '00080', name: 'Phường Trương Định' },
                ],
            },
            {
                code: '008',
                name: 'Quận Hoàng Mai',
                wards: [
                    { code: '00081', name: 'Phường Trần Phú' },
                    { code: '00082', name: 'Phường Hoàng Văn Thụ' },
                    { code: '00083', name: 'Phường Quang Trung' },
                    { code: '00084', name: 'Phường Trương Định' },
                    { code: '00085', name: 'Phường Định Công' },
                    { code: '00086', name: 'Phường Thịnh Liệt' },
                    { code: '00087', name: 'Phường Hoàng Liệt' },
                    { code: '00088', name: 'Phường Yên Sở' },
                    { code: '00089', name: 'Phường Sở Thượng' },
                    { code: '00090', name: 'Phường Dương Nội' },
                ],
            },
            {
                code: '009',
                name: 'Quận Thanh Xuân',
                wards: [
                    { code: '00091', name: 'Phường Nhân Chính' },
                    { code: '00092', name: 'Phường Thượng Đình' },
                    { code: '00093', name: 'Phường Khương Trung' },
                    { code: '00094', name: 'Phường Thanh Xuân Trung' },
                    { code: '00095', name: 'Phường Khương Mai' },
                    { code: '00096', name: 'Phường Phương Liệt' },
                    { code: '00097', name: 'Phường Hạ Đình' },
                    { code: '00098', name: 'Phường Thanh Xuân Bắc' },
                    { code: '00099', name: 'Phường Thanh Xuân Nam' },
                    { code: '00100', name: 'Phường Kim Giang' },
                ],
            },
        ],
    },
    {
        code: '79',
        name: 'Thành phố Hồ Chí Minh',
        districts: [
            {
                code: '760',
                name: 'Quận 1',
                wards: [
                    { code: '00101', name: 'Phường Tân Định' },
                    { code: '00102', name: 'Phường Đa Kao' },
                    { code: '00103', name: 'Phường Bến Nghé' },
                    { code: '00104', name: 'Phường Bến Thành' },
                    { code: '00105', name: 'Phường Nguyễn Thái Bình' },
                    { code: '00106', name: 'Phường Phạm Ngũ Lão' },
                    { code: '00107', name: 'Phường Cầu Ông Lãnh' },
                    { code: '00108', name: 'Phường Cô Giang' },
                    { code: '00109', name: 'Phường Nguyễn Cư Trinh' },
                    { code: '00110', name: 'Phường Cầu Kho' },
                ],
            },
            {
                code: '761',
                name: 'Quận 3',
                wards: [
                    { code: '00111', name: 'Phường Phạm Ngũ Lão' },
                    { code: '00112', name: 'Phường Nguyễn Cư Trinh' },
                    { code: '00113', name: 'Phường Nguyễn Thái Bình' },
                    { code: '00114', name: 'Phường Bến Nghé' },
                    { code: '00115', name: 'Phường Đa Kao' },
                    { code: '00116', name: 'Phường Tân Định' },
                    { code: '00117', name: 'Phường Bến Thành' },
                    { code: '00118', name: 'Phường Võ Thị Sáu' },
                    { code: '00119', name: 'Phường 6' },
                    { code: '00120', name: 'Phường 7' },
                ],
            },
            {
                code: '762',
                name: 'Quận 4',
                wards: [
                    { code: '00121', name: 'Phường 1' },
                    { code: '00122', name: 'Phường 2' },
                    { code: '00123', name: 'Phường 3' },
                    { code: '00124', name: 'Phường 4' },
                    { code: '00125', name: 'Phường 5' },
                    { code: '00126', name: 'Phường 6' },
                    { code: '00127', name: 'Phường 8' },
                    { code: '00128', name: 'Phường 9' },
                    { code: '00129', name: 'Phường 10' },
                    { code: '00130', name: 'Phường 11' },
                    { code: '00131', name: 'Phường 12' },
                    { code: '00132', name: 'Phường 13' },
                    { code: '00133', name: 'Phường 14' },
                    { code: '00134', name: 'Phường 15' },
                ],
            },
            {
                code: '763',
                name: 'Quận 5',
                wards: [
                    { code: '00135', name: 'Phường 1' },
                    { code: '00136', name: 'Phường 2' },
                    { code: '00137', name: 'Phường 3' },
                    { code: '00138', name: 'Phường 4' },
                    { code: '00139', name: 'Phường 5' },
                    { code: '00140', name: 'Phường 6' },
                    { code: '00141', name: 'Phường 7' },
                    { code: '00142', name: 'Phường 8' },
                    { code: '00143', name: 'Phường 9' },
                    { code: '00144', name: 'Phường 10' },
                    { code: '00145', name: 'Phường 11' },
                    { code: '00146', name: 'Phường 12' },
                    { code: '00147', name: 'Phường 13' },
                    { code: '00148', name: 'Phường 14' },
                ],
            },
            {
                code: '764',
                name: 'Quận 6',
                wards: [
                    { code: '00149', name: 'Phường 1' },
                    { code: '00150', name: 'Phường 2' },
                    { code: '00151', name: 'Phường 3' },
                    { code: '00152', name: 'Phường 4' },
                    { code: '00153', name: 'Phường 5' },
                    { code: '00154', name: 'Phường 6' },
                    { code: '00155', name: 'Phường 7' },
                    { code: '00156', name: 'Phường 8' },
                    { code: '00157', name: 'Phường 9' },
                    { code: '00158', name: 'Phường 10' },
                    { code: '00159', name: 'Phường 11' },
                    { code: '00160', name: 'Phường 12' },
                    { code: '00161', name: 'Phường 13' },
                    { code: '00162', name: 'Phường 14' },
                ],
            },
            {
                code: '765',
                name: 'Quận 8',
                wards: [
                    { code: '00163', name: 'Phường 1' },
                    { code: '00164', name: 'Phường 2' },
                    { code: '00165', name: 'Phường 3' },
                    { code: '00166', name: 'Phường 4' },
                    { code: '00167', name: 'Phường 5' },
                    { code: '00168', name: 'Phường 6' },
                    { code: '00169', name: 'Phường 7' },
                    { code: '00170', name: 'Phường 8' },
                    { code: '00171', name: 'Phường 9' },
                    { code: '00172', name: 'Phường 10' },
                    { code: '00173', name: 'Phường 11' },
                    { code: '00174', name: 'Phường 12' },
                    { code: '00175', name: 'Phường 13' },
                    { code: '00176', name: 'Phường 14' },
                    { code: '00177', name: 'Phường 15' },
                    { code: '00178', name: 'Phường 16' },
                ],
            },
            {
                code: '769',
                name: 'Quận Bình Thạnh',
                wards: [
                    { code: '00179', name: 'Phường 1' },
                    { code: '00180', name: 'Phường 2' },
                    { code: '00181', name: 'Phường 3' },
                    { code: '00182', name: 'Phường 5' },
                    { code: '00183', name: 'Phường 6' },
                    { code: '00184', name: 'Phường 7' },
                    { code: '00185', name: 'Phường 11' },
                    { code: '00186', name: 'Phường 12' },
                    { code: '00187', name: 'Phường 13' },
                    { code: '00188', name: 'Phường 14' },
                    { code: '00189', name: 'Phường 15' },
                    { code: '00190', name: 'Phường 17' },
                    { code: '00191', name: 'Phường 19' },
                    { code: '00192', name: 'Phường 21' },
                    { code: '00193', name: 'Phường 22' },
                    { code: '00194', name: 'Phường 24' },
                    { code: '00195', name: 'Phường 25' },
                    { code: '00196', name: 'Phường 26' },
                    { code: '00197', name: 'Phường 27' },
                    { code: '00198', name: 'Phường 28' },
                ],
            },
            {
                code: '770',
                name: 'Quận Gò Vấp',
                wards: [
                    { code: '00199', name: 'Phường 3' },
                    { code: '00200', name: 'Phường 5' },
                    { code: '00201', name: 'Phường 6' },
                    { code: '00202', name: 'Phường 7' },
                    { code: '00203', name: 'Phường 8' },
                    { code: '00204', name: 'Phường 9' },
                    { code: '00205', name: 'Phường 10' },
                    { code: '00206', name: 'Phường 11' },
                    { code: '00207', name: 'Phường 12' },
                    { code: '00208', name: 'Phường 13' },
                    { code: '00209', name: 'Phường 14' },
                    { code: '00210', name: 'Phường 15' },
                    { code: '00211', name: 'Phường 16' },
                    { code: '00212', name: 'Phường 17' },
                ],
            },
            {
                code: '774',
                name: 'Quận Tân Bình',
                wards: [
                    { code: '00213', name: 'Phường 1' },
                    { code: '00214', name: 'Phường 2' },
                    { code: '00215', name: 'Phường 3' },
                    { code: '00216', name: 'Phường 4' },
                    { code: '00217', name: 'Phường 5' },
                    { code: '00218', name: 'Phường 6' },
                    { code: '00219', name: 'Phường 7' },
                    { code: '00220', name: 'Phường 8' },
                    { code: '00221', name: 'Phường 9' },
                    { code: '00222', name: 'Phường 10' },
                    { code: '00223', name: 'Phường 11' },
                    { code: '00224', name: 'Phường 12' },
                    { code: '00225', name: 'Phường 13' },
                    { code: '00226', name: 'Phường 14' },
                    { code: '00227', name: 'Phường 15' },
                ],
            },
            {
                code: '775',
                name: 'Quận Tân Phú',
                wards: [
                    { code: '00228', name: 'Phường Tân Sơn Nhì' },
                    { code: '00229', name: 'Phường Tây Thạnh' },
                    { code: '00230', name: 'Phường Sơn Kỳ' },
                    { code: '00231', name: 'Phường Tân Quý' },
                    { code: '00232', name: 'Phường Tân Thành' },
                    { code: '00233', name: 'Phường Phú Thọ Hoà' },
                    { code: '00234', name: 'Phường Phú Thạnh' },
                    { code: '00235', name: 'Phường Phú Trung' },
                    { code: '00236', name: 'Phường Hòa Thạnh' },
                    { code: '00237', name: 'Phường Hiệp Tân' },
                    { code: '00238', name: 'Phường Hoà Bình' },
                ],
            },
            {
                code: '778',
                name: 'Quận 7',
                wards: [
                    { code: '00239', name: 'Phường Bến Nghé' },
                    { code: '00240', name: 'Phường Đa Kao' },
                    { code: '00241', name: 'Phường Tân Định' },
                    { code: '00242', name: 'Phường Nguyễn Cư Trinh' },
                    { code: '00243', name: 'Phường Cầu Kho' },
                    { code: '00244', name: 'Phường Cô Giang' },
                    { code: '00245', name: 'Phường Phạm Ngũ Lão' },
                    { code: '00246', name: 'Phường 8' },
                    { code: '00247', name: 'Phường 9' },
                    { code: '00248', name: 'Phường 10' },
                    { code: '00249', name: 'Phường 11' },
                    { code: '00250', name: 'Phường 12' },
                    { code: '00251', name: 'Phường 13' },
                    { code: '00252', name: 'Phường 14' },
                    { code: '00253', name: 'Phường 15' },
                    { code: '00254', name: 'Phường 16' },
                ],
            },
        ],
    },
    {
        code: '48',
        name: 'Thành phố Đà Nẵng',
        districts: [
            {
                code: '490',
                name: 'Quận Liên Chiểu',
                wards: [
                    { code: '00255', name: 'Phường Hòa Hiệp Bắc' },
                    { code: '00256', name: 'Phường Hòa Hiệp Nam' },
                    { code: '00257', name: 'Phường Hòa Khánh Bắc' },
                    { code: '00258', name: 'Phường Hòa Khánh Nam' },
                    { code: '00259', name: 'Phường Hòa Minh' },
                ],
            },
            {
                code: '491',
                name: 'Quận Thanh Khê',
                wards: [
                    { code: '00260', name: 'Phường An Khê' },
                    { code: '00261', name: 'Phường Hòa Khê' },
                    { code: '00262', name: 'Phường Thanh Khê Đông' },
                    { code: '00263', name: 'Phường Thanh Khê Tây' },
                    { code: '00264', name: 'Phường Xuân Hà' },
                    { code: '00265', name: 'Phường Tân Chính' },
                    { code: '00266', name: 'Phường Chính Gián' },
                    { code: '00267', name: 'Phường Vĩnh Trung' },
                    { code: '00268', name: 'Phường Thạc Gián' },
                    { code: '00269', name: 'Phường An Đôn' },
                ],
            },
            {
                code: '492',
                name: 'Quận Hải Châu',
                wards: [
                    { code: '00270', name: 'Phường Thanh Bình' },
                    { code: '00271', name: 'Phường Thuận Phước' },
                    { code: '00272', name: 'Phường Thạch Thang' },
                    { code: '00273', name: 'Phường Hải Châu 1' },
                    { code: '00274', name: 'Phường Hải Châu 2' },
                    { code: '00275', name: 'Phường Bình Hiên' },
                    { code: '00276', name: 'Phường Bình Thuận' },
                    { code: '00277', name: 'Phường Hòa Cường Bắc' },
                    { code: '00278', name: 'Phường Hòa Cường Nam' },
                    { code: '00279', name: 'Phường Khuê Trung' },
                ],
            },
            {
                code: '493',
                name: 'Quận Sơn Trà',
                wards: [
                    { code: '00280', name: 'Phường Thanh Bình' },
                    { code: '00281', name: 'Phường Thuận Phước' },
                    { code: '00282', name: 'Phường Thạch Thang' },
                    { code: '00283', name: 'Phường Hải Châu 1' },
                    { code: '00284', name: 'Phường Hải Châu 2' },
                    { code: '00285', name: 'Phường Phước Ninh' },
                    { code: '00286', name: 'Phường Hòa Thuận Tây' },
                    { code: '00287', name: 'Phường Hòa Thuận Đông' },
                    { code: '00288', name: 'Phường Nam Dương' },
                    { code: '00289', name: 'Phường Bình Hiên' },
                    { code: '00290', name: 'Phường Bình Thuận' },
                    { code: '00291', name: 'Phường Hòa Cường' },
                ],
            },
            {
                code: '494',
                name: 'Quận Ngũ Hành Sơn',
                wards: [
                    { code: '00292', name: 'Phường Mỹ An' },
                    { code: '00293', name: 'Phường Khuê Mỹ' },
                    { code: '00294', name: 'Phường Hoà Quý' },
                    { code: '00295', name: 'Phường Hoà Hải' },
                ],
            },
            {
                code: '495',
                name: 'Huyện Hòa Vang',
                wards: [
                    { code: '00296', name: 'Xã Hòa Bắc' },
                    { code: '00297', name: 'Xã Hòa Cầm' },
                    { code: '00298', name: 'Xã Hòa Đông' },
                    { code: '00299', name: 'Xã Hòa Phong' },
                    { code: '00300', name: 'Xã Hòa Phú' },
                    { code: '00301', name: 'Xã Hòa Tiến' },
                    { code: '00302', name: 'Xã Hòa Châu' },
                    { code: '00303', name: 'Xã Hòa Nhơn' },
                    { code: '00304', name: 'Xã Hòa Ninh' },
                    { code: '00305', name: 'Xã Hòa Sơn' },
                ],
            },
        ],
    },
    {
        code: '92',
        name: 'Thành phố Cần Thơ',
        districts: [
            {
                code: '916',
                name: 'Quận Ninh Kiều',
                wards: [
                    { code: '00306', name: 'Phường Cái Khế' },
                    { code: '00307', name: 'Phường An Đông' },
                    { code: '00308', name: 'Phường An Cư' },
                    { code: '00309', name: 'Phường Tân An' },
                    { code: '00310', name: 'Phường Thới Bình' },
                    { code: '00311', name: 'Phường An Nghiệp' },
                    { code: '00312', name: 'Phường Xuân Khánh' },
                    { code: '00313', name: 'Phường Hưng Lợi' },
                    { code: '00314', name: 'Phường Thường Thạnh' },
                    { code: '00315', name: 'Phường Phú Thứ' },
                ],
            },
            {
                code: '917',
                name: 'Quận Bình Thuỷ',
                wards: [
                    { code: '00316', name: 'Phường Bình Thuỷ' },
                    { code: '00317', name: 'Phường Trà Nóc' },
                    { code: '00318', name: 'Phường Thới An Đông' },
                    { code: '00319', name: 'Phường An Thới' },
                    { code: '00320', name: 'Phường Bùi Hữu Nghĩa' },
                    { code: '00321', name: 'Phường Long Tuyền' },
                ],
            },
            {
                code: '918',
                name: 'Quận Cái Răng',
                wards: [
                    { code: '00322', name: 'Phường Lê Bình' },
                    { code: '00323', name: 'Phường Hưng Phú' },
                    { code: '00324', name: 'Phường Ba Láng' },
                    { code: '00325', name: 'Phường Thường Thạnh' },
                    { code: '00326', name: 'Phường Phú Thứ' },
                    { code: '00327', name: 'Phường Tân Phú' },
                ],
            },
            {
                code: '924',
                name: 'Quận Thốt Nốt',
                wards: [
                    { code: '00328', name: 'Phường Thốt Nốt' },
                    { code: '00329', name: 'Phường Thới Long' },
                    { code: '00330', name: 'Phường Trung Nhứt' },
                    { code: '00331', name: 'Phường Tân Lộc' },
                    { code: '00332', name: 'Phường Trung Hưng' },
                    { code: '00333', name: 'Phường Thuận Hưng' },
                    { code: '00334', name: 'Phường Thuận An' },
                ],
            },
            {
                code: '925',
                name: 'Huyện Phong Điền',
                wards: [
                    { code: '00335', name: 'Thị trấn Phong Điền' },
                    { code: '00336', name: 'Xã Mỹ Khánh' },
                    { code: '00337', name: 'Xã Nhơn Ái' },
                    { code: '00338', name: 'Xã Tân Thới' },
                    { code: '00339', name: 'Xã Giai Xuân' },
                    { code: '00340', name: 'Xã Trường Long' },
                ],
            },
            {
                code: '926',
                name: 'Huyện Cờ Đỏ',
                wards: [
                    { code: '00341', name: 'Thị trấn Cờ Đỏ' },
                    { code: '00342', name: 'Xã Thạnh Phú' },
                    { code: '00343', name: 'Xã Trung Hưng' },
                    { code: '00344', name: 'Xã Đông Hiệp' },
                    { code: '00345', name: 'Xã Đông Thắng' },
                ],
            },
        ],
    },
];

function toSlug(name: string, parentCode?: string): string {
    const base = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, m => (m === 'đ' ? 'd' : 'D'))
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    return parentCode ? `${base}-${parentCode}` : base;
}

export const seedingLocationsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding locations (provinces, districts, wards)...');

    // Clear existing data
    await prisma.ward.deleteMany();
    await prisma.district.deleteMany();
    await prisma.province.deleteMany();

    let totalProvinces = 0;
    let totalDistricts = 0;
    let totalWards = 0;

    for (const provinceData of RAW_DATA) {
        await prisma.province.create({
            data: {
                code: provinceData.code,
                name: provinceData.name,
                slug: toSlug(provinceData.name),
            },
        });
        totalProvinces++;

        for (const districtData of provinceData.districts) {
            await prisma.district.create({
                data: {
                    code: districtData.code,
                    provinceCode: provinceData.code,
                    name: districtData.name,
                    slug: toSlug(districtData.name, provinceData.code),
                },
            });
            totalDistricts++;

            for (const wardData of districtData.wards) {
                await prisma.ward.create({
                    data: {
                        code: wardData.code,
                        districtCode: districtData.code,
                        name: wardData.name,
                        slug: toSlug(wardData.name, districtData.code),
                    },
                });
                totalWards++;
            }
        }
    }

    console.log(
        `    ✓ Seeded: ${totalProvinces} provinces, ${totalDistricts} districts, ${totalWards} wards`,
    );
};
