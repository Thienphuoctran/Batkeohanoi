// components/pitch/PitchMapSection.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Navigation, Phone, Car, Zap, 
  Sparkles, Share2, CheckCircle2, 
  Compass, Search, Clock,
  ExternalLink, Check
} from 'lucide-react';
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";

export interface PitchData {
  id: string;
  name: string;
  district: string;
  districtLabel: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  managerName: string;
  totalSubPitches: number; // Số sân 7
  turfType: string;
  parkingFee: string;
  floodlight: string;
  priceRange: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
}

export const HANOI_PITCHES: PitchData[] = [
  // ================= 1. QUẬN CẦU GIẤY =================
  {
    id: 'thanhphat',
    name: 'Cụm Sân Bóng Đá Thành Phát',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 2 Hoàng Minh Giám, Phường Trung Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0068,
    lng: 105.7989,
    phone: '0858658899',
    managerName: 'Ban Quản Lý Thành Phát',
    totalSubPitches: 8,
    turfType: 'Cỏ nhân tạo kim cương sợi xoắn 50mm, lót cao su giảm chấn chuẩn FIFA',
    parkingFee: 'Bãi đỗ ô tô 60 xe (30k), xe máy 5k có bảo vệ 24/7',
    floodlight: 'Hệ thống 16 cột đèn cao áp độc lập chiếu sáng rực rỡ không góc tối',
    priceRange: '650.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:30',
    rating: 4.9,
    reviewCount: 245,
    amenities: ['Phòng thay đồ có khóa', 'Nước điện giải ướp lạnh', 'Bình xịt giảm đau', 'Trọng tài theo yêu cầu', 'Khán đài theo dõi']
  },
  {
    id: 'pvv-tranthaitong',
    name: 'Sân Bóng Đá PVV (Trần Thái Tông)',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 92 Trần Thái Tông (ngõ 72), Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    lat: 21.0315,
    lng: 105.7872,
    phone: '0912563468',
    managerName: 'Anh Chiến Quản Lý',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ nhân tạo cao cấp, thoát nước nhanh, độ nảy bóng cực chuẩn',
    parkingFee: 'Bãi đỗ ô tô và xe máy rộng rãi có vé tự động (30k/5k)',
    floodlight: 'Dàn đèn LED thể thao 1000W sáng đều khắp sân',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 198,
    amenities: ['Tắm nóng lạnh', 'Bình xịt lạnh', 'Căng tin giải khát', 'Áo bib thi đấu 2 màu', 'Wifi tốc độ cao']
  },
  {
    id: 'thanhdong',
    name: 'Sân Bóng Đá Thành Đồng',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'B9 ngõ 25 Nguyễn Chánh, Phường Trung Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0089,
    lng: 105.7952,
    phone: '0945697597',
    managerName: 'Ban Quản Lý Thành Đồng',
    totalSubPitches: 6,
    turfType: 'Sân bóng đại bản doanh phong trào phủi Hà Thành, cỏ sợi đay êm ái',
    parkingFee: 'Bãi đỗ xe ô tô 40 xe (30k), xe máy miễn phí',
    floodlight: 'Đèn cao áp thể thao chuyên dụng không chói mắt cầu môn',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 23:00',
    rating: 4.8,
    reviewCount: 176,
    amenities: ['Trà đá nước ngọt mát lạnh', 'Băng dán cơ y tế', 'Cho mượn áo tập', 'Khu ngồi nghỉ thoáng mát']
  },
  {
    id: 'trungkinh',
    name: 'Sân Bóng Đá Trung Kính Hạ (Tú Mỡ)',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 3 Phố Tú Mỡ, Phường Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0118,
    lng: 105.7932,
    phone: '0983123456',
    managerName: 'Anh Tuấn Trung Kính',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo hạt cao su chuẩn, êm chân, bám giày đinh TF',
    parkingFee: 'Bãi xe ô tô 30 xe (30k), xe máy miễn phí có bảo vệ',
    floodlight: 'Dàn đèn LED 800W bảo đảm chiếu sáng các trận đêm',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '06:00 - 23:00',
    rating: 4.8,
    reviewCount: 160,
    amenities: ['Tắm nóng lạnh', 'Bình xịt lạnh y tế', 'Căng-tin trà đá', 'Cho thuê áo pitch', 'Wifi tốc độ cao']
  },
  {
    id: 'dongdo2',
    name: 'Sân Bóng Đá Đông Đô 2',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Khu Công viên Cầu Giấy / Hồ điều hòa CV1, Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0255,
    lng: 105.7915,
    phone: '0986676116',
    managerName: 'Anh Hùng Đông Đô',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo mới thay 2025, sợi mềm đàn hồi tốt',
    parkingFee: 'Bãi đỗ ô tô ven công viên cực thoáng (30k), xe máy 5k',
    floodlight: 'Hệ thống đèn chiếu sáng công nghệ mới',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 125,
    amenities: ['Gió hồ công viên mát mẻ', 'Tắm tráng sạch', 'Nước giải khát ướp lạnh', 'Áo bib thi đấu']
  },
  {
    id: 'thanham3',
    name: 'Sân Bóng Đá Thành Lâm 3',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 26 ngõ 3 Tôn Thất Thuyết, Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0278,
    lng: 105.7865,
    phone: '0983513869',
    managerName: 'Anh Lâm Quản Lý',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ sợi đay cao cấp, giảm tối đa ma sát trầy xước',
    parkingFee: 'Bãi ô tô 40 xe (30k), xe máy 5k có thẻ từ',
    floodlight: 'Dàn đèn LED 800W sáng đều mặt cỏ',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 110,
    amenities: ['Căng tin đồ uống phong phú', 'Tắm nóng lạnh', 'Bình xịt lạnh', 'Tủ sạc pin điện thoại']
  },
  {
    id: 'san68-duongdinhnghe',
    name: 'Sân Bóng Đá 68 Dương Đình Nghệ',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 68 Dương Đình Nghệ, Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0242,
    lng: 105.7892,
    phone: '0965724292',
    managerName: 'Anh Long 68',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo tiêu chuẩn phong trào, mặt sân bằng phẳng',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống đèn cao áp 800W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 88,
    amenities: ['Trà đá vỉa hè thoáng mát', 'Bình xịt y tế', 'Cho mượn áo tập']
  },
  {
    id: 'phucanh',
    name: 'Sân Bóng Đá Phúc Anh',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Ngõ 72 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    lat: 21.0305,
    lng: 105.7885,
    phone: '0983775032',
    managerName: 'Anh Phúc Quản Lý',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, độ nảy bóng tốt',
    parkingFee: 'Bãi ô tô 25 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED công suất lớn',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 92,
    amenities: ['Nước mía nguyên chất', 'Tắm nóng lạnh', 'Băng dán chấn thương', 'Áo bib 2 màu']
  },
  {
    id: 'fpt-tonthatthuyet',
    name: 'Sân Bóng Đá FPT Tôn Thất Thuyết',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Ngã tư Trần Thái Tông – Tôn Thất Thuyết, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    lat: 21.0298,
    lng: 105.7845,
    phone: '0932332965',
    managerName: 'Anh Tùng FPT',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, bề mặt thoát nước nhanh',
    parkingFee: 'Bãi xe ô tô khuôn viên toà nhà (30k), xe máy 5k',
    floodlight: 'Đèn LED thể thao 800W',
    priceRange: '650.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 115,
    amenities: ['Vị trí đắc địa gần văn phòng', 'Căng tin nước ngọt', 'Bình xịt lạnh']
  },
  {
    id: 'ankhanh',
    name: 'Sân Bóng Đá An Khánh',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 1 Hoàng Minh Giám, Trung Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0055,
    lng: 105.8005,
    phone: '0968861236',
    managerName: 'Anh Khánh',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo kim cương dày dặn, bám sân',
    parkingFee: 'Bãi xe ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 130,
    amenities: ['Căng tin giải khát', 'Tắm tráng sạch', 'Bóng thi đấu chuẩn']
  },
  {
    id: 'ngocbao',
    name: 'Sân Bóng Đá Ngọc Bảo',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 68 Mạc Thái Tông, Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0175,
    lng: 105.7925,
    phone: '02435725273',
    managerName: 'Ban Quản Lý Ngọc Bảo',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, giảm chấn va chạm',
    parkingFee: 'Bãi ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED thể thao sáng rõ',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 84,
    amenities: ['Trà đá giải khát', 'Bình xịt y tế', 'Áo bib thi đấu']
  },
  {
    id: 'd30-caugiay',
    name: 'Sân Bóng Đá D30 Bộ Công An',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 1 Tôn Thất Thuyết, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    lat: 21.0289,
    lng: 105.7834,
    phone: '0913554422',
    managerName: 'Anh Bảo',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo tiêu chuẩn cơ quan, mặt sân phẳng',
    parkingFee: 'Bãi ô tô 30 xe (30k), xe máy 5k an ninh đảm bảo',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '650.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 78,
    amenities: ['An ninh khu vực tốt', 'Trà đá vỉa hè', 'Tủ để đồ', 'Bình xịt lạnh']
  },
  {
    id: 'yenhoa-arena',
    name: 'Sân Bóng Đá Yên Hòa Arena',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Ngõ 259 Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0212,
    lng: 105.7955,
    phone: '0977221144',
    managerName: 'Anh Tuấn Yên Hòa',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt lót cao su chống xước gối',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô đỗ đường lớn',
    floodlight: 'Đèn LED thể thao 800W',
    priceRange: '600.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 68,
    amenities: ['Nước mía căng tin', 'Bình xịt chấn thương', 'Áo bib thi đấu']
  },

  // ================= 2. QUẬN THANH XUÂN =================
  {
    id: 'khongquan',
    name: 'Sân Bóng Phòng Không - Không Quân',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Số 3 Lê Trọng Tấn (ngõ 168), Khương Mai, Thanh Xuân, Hà Nội',
    lat: 20.9982,
    lng: 105.8315,
    phone: '0858658899',
    managerName: 'Đại Diện BQL Quân Đội',
    totalSubPitches: 7,
    turfType: 'Mặt sân quân đội chuẩn quốc gia, cỏ nhân tạo 50mm giảm chấn tối đa',
    parkingFee: 'Khu đỗ xe quân sự cực an ninh, ô tô 30k, xe máy 5k',
    floodlight: 'Hệ thống đèn LED thể thao cao cấp không sấp bóng',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 260,
    amenities: ['Khu an ninh bảo vệ nghiêm ngặt', 'Tắm nóng lạnh', 'Căng tin đồ uống phong phú', 'Áo bib chuẩn', 'Băng ghế dự bị có mái che']
  },
  {
    id: 'topgroup',
    name: 'Sân Bóng Top Group (Khuất Duy Tiến)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngã 3 Lê Văn Lương - Khuất Duy Tiến, Thanh Xuân, Hà Nội',
    lat: 21.0015,
    lng: 105.7985,
    phone: '0856891616',
    managerName: 'BQL Sân Top Group',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ nhân tạo chuyên nghiệp, vị trí ngã tư đắc địa',
    parkingFee: 'Bãi đỗ ô tô 50 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED cao áp công nghệ mới',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 185,
    amenities: ['Tắm nóng lạnh', 'Căng tin nước uống', 'Bình xịt y tế', 'Wifi miễn phí']
  },
  {
    id: 'viettel1',
    name: 'Sân Bóng Đá Viettel 1 (Trường Chinh)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngách 155/206 đường Trường Chinh, Khương Mai, Thanh Xuân, Hà Nội',
    lat: 20.9995,
    lng: 105.8354,
    phone: '0858658899',
    managerName: 'Anh Hùng Viettel',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ sợi đay cao cấp của trung tâm thể thao Viettel',
    parkingFee: 'Bãi đỗ ô tô và xe máy rộng rãi có vé tự động (30k/5k)',
    floodlight: 'Dàn đèn LED 1000W sáng trưng không góc chết',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 168,
    amenities: ['Phòng thay đồ có tủ cá nhân', 'Tắm nóng lạnh', 'Bình xịt lạnh', 'Wifi Viettel tốc độ cao', 'Căng-tin cà phê nước mía']
  },
  {
    id: 'bocongan-nguyenxien',
    name: 'Sân Bóng Bộ Công An - Nguyễn Xiển',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Số 369 Nguyễn Xiển (gần ngã ba Cầu Dậu), Thanh Xuân, Hà Nội',
    lat: 20.9912,
    lng: 105.8085,
    phone: '0858885555',
    managerName: 'BQL Sân Thể Thao BCA',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo kim cương tiêu chuẩn thi đấu nội bộ ngành',
    parkingFee: 'Bãi đỗ ô tô 60 xe thoải mái (30k), xe máy miễn phí',
    floodlight: 'Giàn đèn thể thao 12 cột cao áp siêu sáng',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 145,
    amenities: ['An ninh trật tự tuyệt đối', 'Tắm nóng lạnh', 'Bóng thi đấu Động Lực', 'Trọng tài theo yêu cầu']
  },
  {
    id: 'khuongha',
    name: 'Sân Bóng Đá Khương Hạ',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Phố Khương Hạ (ngõ 29), Khương Đình, Thanh Xuân, Hà Nội',
    lat: 20.9888,
    lng: 105.8215,
    phone: '0987866389',
    managerName: 'Bác Thắng Quản Lý',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su êm ái chống xước',
    parkingFee: 'Xe máy 5k, ô tô đỗ ngõ rộng miễn phí',
    floodlight: 'Đèn LED 600W sáng đều mặt sân',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 75,
    amenities: ['Trà đá nước ngọt mát lạnh', 'Bình xịt lạnh', 'Cho mượn bóng và áo tập']
  },
  {
    id: 'thuongdinh',
    name: 'Sân Bóng Đá Thượng Đình (Nguyễn Trãi)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Số 129 Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    lat: 20.9961,
    lng: 105.8142,
    phone: '0842347826',
    managerName: 'Anh Hoàng Thượng Đình',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, bề mặt bằng phẳng',
    parkingFee: 'Bãi xe khuôn viên công ty Cao su Thượng Đình (30k/5k)',
    floodlight: 'Đèn cao áp chiếu sáng tốt phục vụ đá tối',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 82,
    amenities: ['Trà đá căng tin sạch', 'Bình xịt y tế', 'Cho mượn áo bib', 'Khu ngồi chờ có mái che']
  },
  {
    id: 'minhkiet',
    name: 'Sân Bóng Đá Minh Kiệt (Hoàng Minh Giám)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Đường Hoàng Minh Giám (giáp Thanh Xuân - Cầu Giấy), Hà Nội',
    lat: 21.0035,
    lng: 105.8012,
    phone: '0978102022',
    managerName: 'Anh Kiệt',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi đay mới thay, đàn hồi tốt',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED cao áp sáng chuẩn',
    priceRange: '650.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 112,
    amenities: ['Căng tin giải khát', 'Tắm tráng sạch sẽ', 'Bình xịt lạnh']
  },
  {
    id: 'sontrang2',
    name: 'Sân Bóng Sơn Trang 2',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Số 1 Hoàng Minh Giám, Thanh Xuân, Hà Nội',
    lat: 21.0042,
    lng: 105.8008,
    phone: '0988005065',
    managerName: 'BQL Sơn Trang 2',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo kim cương, hạt cao su đàn hồi êm chân',
    parkingFee: 'Bãi ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống đèn LED công suất lớn',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 120,
    amenities: ['Nước khoáng lạnh', 'Tắm nóng lạnh', 'Bóng thi đấu chuẩn', 'Khán đài theo dõi']
  },
  {
    id: 'kimgiang',
    name: 'Sân Bóng Đá Kim Giang',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngõ 64 Kim Giang, Khương Đình, Thanh Xuân, Hà Nội',
    lat: 20.9855,
    lng: 105.8182,
    phone: '0936112233',
    managerName: 'Chú Bình Kim Giang',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo 5cm lót hạt cao su đen đàn hồi tiêu chuẩn',
    parkingFee: 'Xe máy 5k, ô tô đỗ ven hồ nước miễn phí thoáng rộng',
    floodlight: 'Đèn cao áp 800W bảo đảm sáng rõ mọi góc cầu môn',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 95,
    amenities: ['Phục vụ trà đá quạt gió', 'Băng chun sơ cứu cổ chân', 'Áo tập 2 màu', 'Khu ngồi nghỉ ven hồ']
  },
  {
    id: 'damhong',
    name: 'Sân Bóng Đá Đầm Hồng (Khương Đình)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Khu sinh thái Đầm Hồng, Khương Đình, Thanh Xuân, Hà Nội',
    lat: 20.9935,
    lng: 105.8268,
    phone: '0972334411',
    managerName: 'Anh Quyết Đầm Hồng',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ sợi gân mới thay 2025, thoát nước cực tốt',
    parkingFee: 'Bãi ô tô rộng ven hồ nước (30k), xe máy 5k',
    floodlight: 'Đèn LED thể thao 800W bảo vệ mắt cầu thủ',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 110,
    amenities: ['Gió hồ mát tự nhiên', 'Tắm tráng sạch sẽ', 'Nước mía nguyên chất', 'Băng chun quấn cổ chân']
  },

  // ================= 3. QUẬN NAM TỪ LIÊM =================
  {
    id: 'tanmy',
    name: 'Cụm Sân Tân Mỹ (Mỹ Đình)',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Số 268 Tân Mỹ (sát sân Golf Phương Đông), Mỹ Đình, Nam Từ Liêm, Hà Nội',
    lat: 21.0289,
    lng: 105.7634,
    phone: '0858658899',
    managerName: 'BQL Cụm Sân Tân Mỹ',
    totalSubPitches: 10,
    turfType: 'Cụm sân quy mô lớn chuẩn tổ chức các giải phủi HPL',
    parkingFee: 'Bãi ô tô cực đại sức chứa 150 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống giàn đèn chuyên nghiệp chiếu sáng toàn bộ 10 sân',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:00 - 23:30',
    rating: 4.9,
    reviewCount: 320,
    amenities: ['Khán đài hàng ngàn chỗ ngồi', 'Phòng thay đồ VIP', 'Bình xịt y tế', 'Căng-tin đồ ăn nhẹ', 'Trọng tài VFF']
  },
  {
    id: 'thanham-vtc',
    name: 'Sân Bóng Thành Lâm VTC',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Thôn Nhân Mỹ, Phường Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    lat: 21.0275,
    lng: 105.7712,
    phone: '0985136869',
    managerName: 'Anh Tuấn Thành Lâm',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi đay cao cấp, mặt sân bằng phẳng',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED cao áp 800W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 135,
    amenities: ['Căng tin đồ uống', 'Tắm nóng lạnh', 'Bình xịt lạnh', 'Cho mượn áo bib']
  },
  {
    id: 'mydinh2',
    name: 'Sân Bóng Đá Mỹ Đình 2',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Số 32 Đường Mỹ Đình, Phường Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    lat: 21.0295,
    lng: 105.7725,
    phone: '0966116365',
    managerName: 'Anh Hùng Mỹ Đình',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ kim cương êm chân, bám giày đinh TF',
    parkingFee: 'Bãi đỗ xe máy rộng (5k), ô tô đỗ đường lớn (30k)',
    floodlight: 'Đèn LED thể thao sáng chuẩn',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 23:00',
    rating: 4.6,
    reviewCount: 98,
    amenities: ['Trà đá nước ngọt', 'Bình xịt chấn thương', 'Tủ sạc pin điện thoại']
  },
  {
    id: 'metri',
    name: 'Sân Bóng Đá Mễ Trì Thượng',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Mễ Trì Thượng (gần Đại lộ Thăng Long), Mễ Trì, Nam Từ Liêm, Hà Nội',
    lat: 21.0152,
    lng: 105.7789,
    phone: '0986528891',
    managerName: 'Anh Cường Mễ Trì',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ nhân tạo chuyên phủi, sợi dày êm ái chống xước',
    parkingFee: 'Bãi gửi ô tô và xe máy rộng rãi miễn phí hoàn toàn',
    floodlight: 'Đèn LED công nghệ mới chống chói mắt góc rộng',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 165,
    amenities: ['Căng tin nước mía sạch', 'Wifi miễn phí', 'Tủ sạc pin điện thoại', 'Băng chun sơ cứu', 'Tắm tráng sạch']
  },
  {
    id: 'nhanmy',
    name: 'Sân Bóng Đá Nhân Mỹ',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Ngã ba Thiên Hiền, Phường Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    lat: 21.0235,
    lng: 105.7738,
    phone: '0904141089',
    managerName: 'BQL Sân Nhân Mỹ',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su chống xước',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô 20 xe (30k)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 82,
    amenities: ['Trà đá vỉa hè', 'Bình xịt y tế', 'Cho mượn áo bib']
  },
  {
    id: 'mhdi',
    name: 'Sân Bóng MHDI (Lê Đức Thọ)',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Lê Đức Thọ, Phường Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    lat: 21.0325,
    lng: 105.7665,
    phone: '0961389859',
    managerName: 'Anh Hưng MHDI',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo quân đội bền bỉ, hạt cao su phân bố đều',
    parkingFee: 'Khu đỗ xe quân sự MHDI cực an ninh (30k/5k)',
    floodlight: 'Dàn đèn LED 800W bảo đảm tầm nhìn ban đêm',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 140,
    amenities: ['An ninh cực tốt', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Áo bib thi đấu']
  },
  {
    id: 'coma6',
    name: 'Sân Bóng Coma 6 (Dream Town)',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'KĐT Dream Town, Phường Tây Mỗ, Nam Từ Liêm, Hà Nội',
    lat: 21.0025,
    lng: 105.7425,
    phone: '0858658899',
    managerName: 'BQL Sân Coma 6',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo mới, không gian yên tĩnh ven khu đô thị',
    parkingFee: 'Bãi đỗ ô tô 30 xe miễn phí, xe máy 5k',
    floodlight: 'Đèn LED thể thao 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 70,
    amenities: ['Không gian thoáng mát', 'Trà đá giải khát', 'Bình xịt lạnh']
  },
  {
    id: 'haidang-sontrang5',
    name: 'Sân Bóng Hải Đăng & Sơn Trang 5',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Số 56 Phố Tố Hữu, Trung Văn, Nam Từ Liêm, Hà Nội',
    lat: 20.9982,
    lng: 105.7875,
    phone: '0961678071',
    managerName: 'BQL Hải Đăng - Sơn Trang',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo kim cương sợi đôi cao cấp, đàn hồi tuyệt hảo',
    parkingFee: 'Bãi đỗ ô tô 50 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED 1000W sáng trưng',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:30',
    rating: 4.8,
    reviewCount: 155,
    amenities: ['Căng tin đồ uống phong phú', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Tủ để đồ']
  },
  {
    id: 'trungvan',
    name: 'Sân Bóng Trung Văn',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Khu vực Trường Cấp 2 Trung Văn, Nam Từ Liêm, Hà Nội',
    lat: 20.9965,
    lng: 105.7892,
    phone: '0933698688',
    managerName: 'Anh Thắng Trung Văn',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào êm chân',
    parkingFee: 'Xe máy 5k, ô tô đỗ đường lớn',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 65,
    amenities: ['Trà đá nước mía', 'Bình xịt lạnh', 'Cho mượn áo bib']
  },
  {
    id: 'mirolin',
    name: 'Sân Bóng Mirolin Sport Club',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Lê Đức Thọ (đối diện SVĐ Quốc Gia Mỹ Đình), Nam Từ Liêm, Hà Nội',
    lat: 21.0245,
    lng: 105.7658,
    phone: '0363035585',
    managerName: 'BQL Mirolin Club',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo cao cấp, view đối diện sân Mỹ Đình hoành tráng',
    parkingFee: 'Bãi ô tô 60 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống đèn LED thể thao cao cấp',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:00 - 23:30',
    rating: 4.9,
    reviewCount: 195,
    amenities: ['View SVĐ Quốc gia cực chất', 'Tắm nóng lạnh', 'Căng tin máy lạnh', 'Bình xịt y tế']
  },
  {
    id: 'dinhthon',
    name: 'Sân Bóng Đá Đình Thôn',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Ngõ 39 Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    lat: 21.0175,
    lng: 105.7745,
    phone: '0944556677',
    managerName: 'Anh Hải Đình Thôn',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo chất lượng cao, thoát nước cực nhanh khi mưa',
    parkingFee: 'Bãi xe máy rộng rãi (5k), ô tô đỗ đường nội bộ miễn phí',
    floodlight: 'Dàn đèn cao áp 800W chuẩn phủi đêm',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 23:00',
    rating: 4.6,
    reviewCount: 88,
    amenities: ['Trà đá vỉa hè thoáng mát', 'Bình xịt lạnh', 'Cho mượn bóng', 'Tủ đồ an toàn']
  },
  {
    id: 'mic-luongthevinh',
    name: 'Sân Bóng Đá Mic (Lương Thế Vinh)',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Lương Thế Vinh, Trung Văn, Nam Từ Liêm, Hà Nội',
    lat: 20.9954,
    lng: 105.7942,
    phone: '0915223388',
    managerName: 'Anh Việt Mic',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo êm ái, sân rộng thoáng mát',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k an toàn',
    floodlight: 'Dàn đèn LED cao áp công suất lớn',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 125,
    amenities: ['Căng tin nước mía sạch', 'Tắm nóng lạnh', 'Bóng thi đấu chuẩn', 'Tủ sạc pin điện thoại']
  },

  // ================= 4. QUẬN BẮC TỪ LIÊM =================
  {
    id: 'minhkhai-nguyenxa',
    name: 'Sân Bóng Minh Khai – Nguyên Xá',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Ngõ 136 đường Cầu Diễn, Phường Minh Khai, Bắc Từ Liêm, Hà Nội',
    lat: 21.0545,
    lng: 105.7485,
    phone: '0772229223',
    managerName: 'Anh Thắng Minh Khai',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi đay mới thay, mặt sân bằng phẳng',
    parkingFee: 'Bãi đỗ ô tô 30 xe (20k), xe máy 5k',
    floodlight: 'Đèn LED 800W sáng đều sân',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 110,
    amenities: ['Gần ĐH Công Nghiệp', 'Căng tin nước mía sinh viên', 'Bình xịt lạnh', 'Cho mượn áo tập']
  },
  {
    id: 'conhue-8b',
    name: 'Sân Bóng Cổ Nhuế (Xóm 8B)',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Xóm 8B, đường Tăng Thiết Giáp, Cổ Nhuế, Bắc Từ Liêm, Hà Nội',
    lat: 21.0625,
    lng: 105.7812,
    phone: '02462521199',
    managerName: 'BQL Sân Cổ Nhuế',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su chống xước',
    parkingFee: 'Bãi ô tô 20 xe (20k), xe máy 5k',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 65,
    amenities: ['Trà đá nước ngọt', 'Bình xịt giảm đau', 'Áo bib thi đấu']
  },
  {
    id: 'phamvandong',
    name: 'Sân Bóng Phạm Văn Đồng',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Số 232 - 234 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội',
    lat: 21.0515,
    lng: 105.7825,
    phone: '0908123669',
    managerName: 'Anh Dũng',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, gần ngã tư Hoàng Quốc Việt',
    parkingFee: 'Bãi xe ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 78,
    amenities: ['Căng tin giải khát', 'Tắm tráng', 'Bình xịt y tế']
  },
  {
    id: 'ducthang-10',
    name: 'Sân Bóng Số 10 Đức Thắng',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Số 10 đường Đức Thắng, Đông Ngạc, Bắc Từ Liêm, Hà Nội',
    lat: 21.0765,
    lng: 105.7745,
    phone: '0906296116',
    managerName: 'Anh Tuấn Đức Thắng',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, sân thoáng mát nhiều cây xanh',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô đỗ ven đường miễn phí',
    floodlight: 'Đèn LED 600W sáng đều',
    priceRange: '450.000đ - 650.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 52,
    amenities: ['Trà đá nước mía giá rẻ', 'Cho mượn áo tập', 'Bình xịt lạnh']
  },
  {
    id: 'modiachat',
    name: 'Sân Bóng ĐH Mỏ - Địa Chất',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Số 18 Phố Viên, Đức Thắng, Bắc Từ Liêm, Hà Nội',
    lat: 21.0712,
    lng: 105.7768,
    phone: '0979445566',
    managerName: 'Anh Tuấn Anh Mỏ',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm ái, sân thoáng mát nhiều cây xanh',
    parkingFee: 'Bãi xe khuôn viên trường rộng rãi, an toàn (5k)',
    floodlight: 'Đèn cao áp sáng tốt phục vụ đá tối',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.6,
    reviewCount: 65,
    amenities: ['Nước mía căng-tin sạch sẽ', 'Khu gửi đồ an toàn', 'Cho mượn áo tập', 'Bình xịt chấn thương']
  },

  // ================= 5. QUẬN ĐỐNG ĐA =================
  {
    id: 'hoangcau',
    name: 'Sân Bóng Đá Hoàng Cầu (Trung Tâm TDTT Đống Đa)',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Số 59 Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội',
    lat: 21.0182,
    lng: 105.8254,
    phone: '0858658899',
    managerName: 'Ban Quản Lý Sân Hoàng Cầu',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi kim cương, độ nảy bóng chuẩn, view hồ Hoàng Cầu',
    parkingFee: 'Bãi ô tô đỗ ven hồ (30k), xe máy 5k có người trông',
    floodlight: 'Hệ thống đèn LED thể thao không góc chết',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 165,
    amenities: ['Gió hồ Hoàng Cầu thoáng mát', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Áo bib thi đấu']
  },
  {
    id: 'thuyloi',
    name: 'Sân Cỏ Nhân Tạo ĐH Thủy Lợi',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Số 175 Tây Sơn (ngõ 95 Chùa Bộc), Trung Liệt, Đống Đa, Hà Nội',
    lat: 21.0076,
    lng: 105.8239,
    phone: '0945998877',
    managerName: 'Thầy Hưng Ban QL Thủy Lợi',
    totalSubPitches: 4,
    turfType: 'Mặt cỏ cụm trường đại học chuẩn thi đấu sinh viên & phong trào',
    parkingFee: 'Nhà để xe trường ĐH Thủy Lợi (an toàn có vé 5k)',
    floodlight: 'Dàn đèn LED chuẩn sân thi đấu giải',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 132,
    amenities: ['Khán đài có mái che', 'Nhà vệ sinh sạch sẽ', 'Máy bán nước tự động', 'Tủ để đồ cá nhân']
  },
  {
    id: 'congdoan',
    name: 'Sân Bóng Đại Học Công Đoàn',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Số 169 Tây Sơn, Quang Trung, Đống Đa, Hà Nội',
    lat: 21.0092,
    lng: 105.8215,
    phone: '0976554411',
    managerName: 'Thầy Phong Công Đoàn',
    totalSubPitches: 3,
    turfType: 'Mặt cỏ nhân tạo phong trào êm chân',
    parkingFee: 'Gửi xe trong trường an toàn (5k)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 70,
    amenities: ['Căng tin sinh viên giá rẻ', 'Bình xịt lạnh', 'Cho mượn áo tập']
  },
  {
    id: 'daihocy',
    name: 'Sân Bóng Đại Học Y Hà Nội',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Số 1 Tôn Thất Tùng, Khương Thượng, Đống Đa, Hà Nội',
    lat: 21.0028,
    lng: 105.8315,
    phone: '0988443322',
    managerName: 'BQL Sân Thể Thao ĐH Y',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, mặt sân sạch sẽ trong khuôn viên trường Y',
    parkingFee: 'Bãi gửi xe trong trường an toàn (5k)',
    floodlight: 'Đèn LED thể thao sáng tốt',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 120,
    amenities: ['Y tế tại chỗ', 'Căng tin đồ uống', 'Tắm nóng lạnh', 'Áo bib thi đấu']
  },

  // ================= 6. QUẬN BA ĐÌNH & TÂY HỒ =================
  {
    id: 'quanngua',
    name: 'Sân Bóng Quần Ngựa (Văn Cao)',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Đường Văn Cao, Phường Liễu Giai, Ba Đình, Hà Nội',
    lat: 21.0385,
    lng: 105.8195,
    phone: '0936356393',
    managerName: 'Ban Quản Lý Cung Quần Ngựa',
    totalSubPitches: 6,
    turfType: 'Khuôn viên Cung thể thao Quần Ngựa cao cấp, cỏ sợi đay chuẩn quốc tế',
    parkingFee: 'Bãi đỗ ô tô cực rộng 100 xe (30k), xe máy 5k có bảo vệ',
    floodlight: 'Giàn đèn chiếu sáng thể thao tiêu chuẩn quốc gia',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 220,
    amenities: ['Khuôn viên thể thao quốc gia', 'Phòng thay đồ có tủ cá nhân', 'Tắm nóng lạnh VIP', 'Căng tin đầy đủ']
  },
  {
    id: 'hoanghoatham',
    name: 'Sân Bóng Hoàng Hoa Thám',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 671 Hoàng Hoa Thám, Vĩnh Phúc, Ba Đình, Hà Nội',
    lat: 21.0425,
    lng: 105.8085,
    phone: '0924055214',
    managerName: 'Anh Thắng Hoàng Hoa Thám',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, độ nảy bóng tốt',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED cao áp 800W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 95,
    amenities: ['Căng tin giải khát', 'Tắm tráng sạch', 'Bình xịt y tế']
  },
  {
    id: 'phucxa',
    name: 'Cụm Sân Bóng Đá Phúc Xá (Hồng Hà)',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 15 Hồng Hà, Phúc Xá, Ba Đình, Hà Nội',
    lat: 21.0489,
    lng: 105.8492,
    phone: '0902995527',
    managerName: 'Anh Thắng Phúc Xá',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ sợi đay mới nâng cấp, không gian ven sông gió mát tự nhiên',
    parkingFee: 'Bãi đỗ ô tô và xe máy rộng rãi, có người trông (30k/5k)',
    floodlight: 'Dàn đèn LED cao áp hiện đại chống lóa',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 22:30',
    rating: 4.7,
    reviewCount: 112,
    amenities: ['Gió sông thoáng mát tự nhiên', 'Tắm nóng lạnh sạch sẽ', 'Căng-tin trà đá giải khát', 'Áo bib thi đấu']
  },
  {
    id: 'san10-10',
    name: 'Sân Bóng 10/10 (Phúc Xá)',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 15A Hồng Hà, Phúc Xá, Ba Đình, Hà Nội',
    lat: 21.0482,
    lng: 105.8488,
    phone: '02437724721',
    managerName: 'Ban Quản Lý Sân 10/10',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su chống xước',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô đỗ đường Hồng Hà (30k)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 80,
    amenities: ['Trà đá nước ngọt ven sông', 'Bình xịt lạnh', 'Cho mượn áo tập']
  },
  {
    id: 'thucnghiem',
    name: 'Sân Bóng Thực Nghiệm Liễu Giai',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 50 Liễu Giai, Cống Vị, Ba Đình, Hà Nội',
    lat: 21.0345,
    lng: 105.8145,
    phone: '02437624117',
    managerName: 'BQL Trường Thực Nghiệm',
    totalSubPitches: 3,
    turfType: 'Mặt sân trường học cao cấp, mặt cỏ êm ái',
    parkingFee: 'Gửi xe trong trường an ninh tuyệt đối (5k)',
    floodlight: 'Đèn LED thể thao sáng tốt',
    priceRange: '600.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.6,
    reviewCount: 75,
    amenities: ['An ninh đảm bảo', 'Nước uống căng tin', 'Bình xịt lạnh']
  },
  {
    id: 'phamhongthai',
    name: 'Sân Bóng Phạm Hồng Thái',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 1 Nguyễn Văn Ngọc, Ba Đình, Hà Nội',
    lat: 21.0312,
    lng: 105.8115,
    phone: '0906561199',
    managerName: 'Anh Hoàng Phạm Hồng Thái',
    totalSubPitches: 3,
    turfType: 'Cỏ nhân tạo phong trào chất lượng tốt, gần Đào Tấn',
    parkingFee: 'Bãi xe máy (5k), ô tô gửi bãi lân cận',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '600.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 68,
    amenities: ['Trà đá vỉa hè', 'Bình xịt chấn thương', 'Áo bib thi đấu']
  },
  {
    id: 'thienmon',
    name: 'Sân Bóng Thiên Môn (Đội Cấn)',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Số 266 Đội Cấn, Liễu Giai, Ba Đình, Hà Nội',
    lat: 21.0365,
    lng: 105.8175,
    phone: '0913318313',
    managerName: 'BQL Sân Thiên Môn',
    totalSubPitches: 3,
    turfType: 'Mặt cỏ nhân tạo giữa trung tâm Ba Đình',
    parkingFee: 'Bãi gửi xe trong ngõ (5k)',
    floodlight: 'Đèn LED thể thao 600W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 62,
    amenities: ['Trung tâm thuận tiện', 'Trà đá giải khát', 'Bình xịt y tế']
  },
  {
    id: 'anduong',
    name: 'Sân Bóng Đá An Dương (Tây Hồ)',
    district: 'TayHo',
    districtLabel: 'Tây Hồ',
    address: 'Ngõ 76 An Dương, Yên Phụ, Tây Hồ, Hà Nội',
    lat: 21.0535,
    lng: 105.8395,
    phone: '0988661133',
    managerName: 'Anh Thành An Dương',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ cao cấp, thoáng đãng không khí trong lành ven hồ',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống đèn chiếu sáng tiêu chuẩn không chói mắt',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 145,
    amenities: ['Không khí trong lành ven hồ', 'Tắm nóng lạnh', 'Căng tin giải khát', 'Bình xịt y tế', 'Wifi miễn phí']
  },
  {
    id: 'quangba',
    name: 'Sân Bóng Ruby Quảng Bá',
    district: 'TayHo',
    districtLabel: 'Tây Hồ',
    address: 'Ngõ 61 Đặng Thai Mai, Quảng An, Tây Hồ, Hà Nội',
    lat: 21.0625,
    lng: 105.8285,
    phone: '0989332211',
    managerName: 'Anh Dũng Quảng Bá',
    totalSubPitches: 4,
    turfType: 'Mặt cỏ nhân tạo cao cấp ven Hồ Tây mát rượi quanh năm',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED cao áp sáng chuẩn',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 130,
    amenities: ['Gió Hồ Tây cực mát', 'Căng tin cà phê nước dừa', 'Tắm nóng lạnh', 'Bình xịt y tế']
  },

  // ================= 7. QUẬN HÀ ĐÔNG =================
  {
    id: 'c500-anninh',
    name: 'Cụm Sân Bóng C500 - Học Viện An Ninh',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Đường 19/5 (trong Học viện An Ninh), Văn Quán, Hà Đông, Hà Nội',
    lat: 20.9812,
    lng: 105.7925,
    phone: '0966886500',
    managerName: 'Thầy Đức Quản Lý C500',
    totalSubPitches: 8,
    turfType: 'Cụm sân phủi huyền thoại sinh viên và phủi Hà Thành, cỏ kim cương',
    parkingFee: 'Bãi đỗ ô tô 80 xe (30k), xe máy 5k trong khuôn viên trường',
    floodlight: 'Hệ thống đèn cao áp chuyên nghiệp cho 8 sân cùng lúc',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 320,
    amenities: ['Khán đài rộng rãi', 'Căng tin đồ uống phong phú', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Tủ sạc điện thoại']
  },
  {
    id: 'zone9-vanquan',
    name: 'Sân Bóng Zone 9 Văn Quán',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Khu đô thị Văn Quán, Yên Phúc, Hà Đông, Hà Nội',
    lat: 20.9765,
    lng: 105.7895,
    phone: '0917698989',
    managerName: 'BQL Zone 9',
    totalSubPitches: 6,
    turfType: 'Cụm sân thể thao tổ hợp hiện đại, cỏ nhân tạo êm chân',
    parkingFee: 'Bãi đỗ ô tô 50 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W sáng đều khắp sân',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 160,
    amenities: ['Tổ hợp cà phê đồ uống', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Bóng thi đấu chuẩn']
  },
  {
    id: 'cuongquoc',
    name: 'Cụm Sân Bóng Đá Cường Quốc (Hà Đông)',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Đường Phúc La - Văn Phú, Đa Sỹ, Kiến Hưng, Hà Đông, Hà Nội',
    lat: 20.9578,
    lng: 105.7891,
    phone: '0962611167',
    managerName: 'Anh Long Cường Quốc',
    totalSubPitches: 6,
    turfType: 'Sân đại bản doanh CLB Phủi Cường Quốc lừng danh bóng đá Hà Thành',
    parkingFee: 'Bãi đỗ ô tô cực rộng rãi 100 xe (Miễn phí)',
    floodlight: 'Đèn LED công suất lớn bao phủ toàn mặt sân',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 185,
    amenities: ['Căng tin đồ ăn nhẹ', 'Khu ghế ngồi khán giả VIP', 'Bình xịt lạnh y tế', 'Trọng tài phong trào', 'Tắm tráng']
  },
  {
    id: 'hatri',
    name: 'Sân Bóng Đá Hà Trì',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Phố Hà Trì, Phường Hà Cầu, Hà Đông, Hà Nội',
    lat: 20.9645,
    lng: 105.7765,
    phone: '0896860004',
    managerName: 'Anh Thắng Hà Trì',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo hạt cao su đen đàn hồi tốt',
    parkingFee: 'Bãi đỗ ô tô 30 xe (20k), xe máy 5k',
    floodlight: 'Đèn LED thể thao 800W',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 96,
    amenities: ['Trà đá nước ngọt', 'Tắm nóng lạnh', 'Bình xịt lạnh']
  },
  {
    id: 'bacviet',
    name: 'Sân Bóng Bắc Việt (Yên Xá)',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Làng Yên Xá, Tân Triều, giáp ranh Hà Đông - Thanh Xuân, Hà Nội',
    lat: 20.9745,
    lng: 105.7985,
    phone: '0969799235',
    managerName: 'Anh Tuấn Bắc Việt',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi đay mới thay, đàn hồi êm ái',
    parkingFee: 'Bãi ô tô 40 xe (20k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 120,
    amenities: ['Căng tin nước mía sạch', 'Tắm nóng lạnh', 'Bình xịt chấn thương']
  },
  {
    id: 'caudo-hadong',
    name: 'Sân Bóng Đá Cầu Đơ',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Số 46 Lê Hồng Phong, Nguyễn Trãi, Hà Đông, Hà Nội',
    lat: 20.9682,
    lng: 105.7725,
    phone: '0356525327',
    managerName: 'Anh Tuấn Cầu Đơ',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo êm chân, bám giày đinh TF',
    parkingFee: 'Bãi đỗ ô tô 30 xe (20k), xe máy miễn phí',
    floodlight: 'Đèn LED công nghệ mới',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 92,
    amenities: ['Trà đá nước giải khát', 'Tắm nóng lạnh', 'Bình xịt giảm đau']
  },
  {
    id: 'mauluong',
    name: 'Sân Bóng Đá Mậu Lương',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Phố Hoàng Công, Phường Kiến Hưng, Hà Đông, Hà Nội',
    lat: 20.9525,
    lng: 105.7925,
    phone: '0963161719',
    managerName: 'Anh Quân Mậu Lương',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ mới nâng cấp, không gian rộng rãi thoáng gió',
    parkingFee: 'Bãi đỗ ô tô 50 xe thoải mái (Miễn phí)',
    floodlight: 'Hệ thống đèn LED thể thao 800W',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 105,
    amenities: ['Bãi đỗ ô tô cực rộng', 'Tắm tráng sạch sẽ', 'Căng tin nước ngọt', 'Bình xịt y tế']
  },
  {
    id: 'kienhung-365',
    name: 'Sân Bóng Kiến Hưng (Chợ 365)',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Khu vực Chợ 365, Phường Kiến Hưng, Hà Đông, Hà Nội',
    lat: 20.9545,
    lng: 105.7875,
    phone: '0814121255',
    managerName: 'BQL Sân Kiến Hưng',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo chất lượng tốt, thoát nước nhanh',
    parkingFee: 'Bãi đỗ xe rộng rãi thoải mái (Miễn phí)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 80,
    amenities: ['Trà đá giải khát', 'Bình xịt chấn thương', 'Áo bib thi đấu']
  },
  {
    id: 'binhminh2',
    name: 'Sân Bóng Bình Minh 2',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Khu công viên thể thao và cây xanh Hà Đông, Cầu Đơ, Hà Đông, Hà Nội',
    lat: 20.9625,
    lng: 105.7785,
    phone: '0366311182',
    managerName: 'Anh Bình',
    totalSubPitches: 5,
    turfType: 'Sân nằm trong khuôn viên công viên cây xanh mát mẻ',
    parkingFee: 'Bãi đỗ ô tô 40 xe (20k), xe máy 5k',
    floodlight: 'Đèn LED 800W',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 110,
    amenities: ['Không khí trong lành công viên', 'Tắm nóng lạnh', 'Căng tin giải khát']
  },
  {
    id: 'thangloi',
    name: 'Sân Bóng Thắng Lợi',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'NO 33 - LK 07 Hà Trì, Phường Hà Cầu, Hà Đông, Hà Nội',
    lat: 20.9655,
    lng: 105.7755,
    phone: '0933565589',
    managerName: 'Anh Lợi',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su êm ái',
    parkingFee: 'Xe máy 5k, ô tô 20k',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 65,
    amenities: ['Trà đá nước ngọt', 'Bình xịt lạnh', 'Cho mượn áo tập']
  },
  {
    id: 'lakhe',
    name: 'Sân Bóng Đá La Khê',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Ngã ba Lý Tự Trọng giao Ngô Đình Mẫn, La Khê, Hà Đông, Hà Nội',
    lat: 20.9735,
    lng: 105.7595,
    phone: '0966856896',
    managerName: 'Anh Tuấn La Khê',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm ái, mặt sân phẳng',
    parkingFee: 'Xe máy 5k, ô tô đỗ đường lớn',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 58,
    amenities: ['Trà đá vỉa hè', 'Bình xịt lạnh', 'Áo bib 2 màu']
  },
  {
    id: 'vanphu',
    name: 'Sân Bóng Đá Văn Phú',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Ngõ 20 Phố Vạn Phúc, Phường Phúc La, Hà Đông, Hà Nội',
    lat: 20.9695,
    lng: 105.7655,
    phone: '0966026286',
    managerName: 'Anh Phú',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi đay mới, thoát nước nhanh',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô 20k',
    floodlight: 'Đèn LED 800W',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 72,
    amenities: ['Nước mía giải khát', 'Tắm tráng sạch', 'Bình xịt y tế']
  },
  {
    id: 'molao',
    name: 'Sân Bóng Đá Mộ Lao',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Tổ 16, Phường Mộ Lao (gần Làng Việt Kiều Châu Âu), Hà Đông, Hà Nội',
    lat: 20.9855,
    lng: 105.7825,
    phone: '0963088986',
    managerName: 'Anh Hưng Mộ Lao',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, thoáng đãng',
    parkingFee: 'Bãi ô tô 30 xe (20k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 85,
    amenities: ['Trà đá cà phê', 'Tắm nóng lạnh', 'Bình xịt giảm đau']
  },
  {
    id: 'vanquan',
    name: 'Sân Bóng Đá KĐT Văn Quán',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Đường 19/5, Khu đô thị Văn Quán, Hà Đông, Hà Nội',
    lat: 20.9785,
    lng: 105.7865,
    phone: '0917483333',
    managerName: 'Anh Thắng Văn Quán',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo sợi đay mới thay, đàn hồi tốt',
    parkingFee: 'Bãi xe ô tô ven hồ Văn Quán (20k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W chiếu sáng đều',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 130,
    amenities: ['Ven hồ Văn Quán thoáng gió', 'Tắm tráng', 'Căng tin đồ uống', 'Áo bib 2 màu']
  },

  // ================= 8. QUẬN HOÀNG MAI =================
  {
    id: 'dinhcong',
    name: 'Cụm Sân Bóng Đá Định Công',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 18 ngõ 175 Định Công (gần cầu Dậu), Hoàng Mai, Hà Nội',
    lat: 20.9782,
    lng: 105.8312,
    phone: '0964058010',
    managerName: 'Anh Quang Định Công',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo sợi đôi cao cấp, hạt cao su trải đều giảm chấn',
    parkingFee: 'Bãi xe ô tô cực rộng chứa 50 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W sáng rõ như ban ngày',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 180,
    amenities: ['Căng-tin trà đá quạt hơi nước', 'Bình xịt lạnh chấn thương', 'Tắm nóng lạnh', 'Bóng thi đấu chuẩn FIFA']
  },
  {
    id: 'thongtin',
    name: 'Sân Bóng Thông Tin (Định Công Hạ)',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 195 Định Công Hạ, Hoàng Mai, Hà Nội',
    lat: 20.9745,
    lng: 105.8335,
    phone: '0965603553',
    managerName: 'BQL Sân Thông Tin',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ sợi đay êm ái, chống trơn trượt tối đa',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED công suất lớn không chói',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 140,
    amenities: ['Căng tin đồ uống phong phú', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Wifi miễn phí']
  },
  {
    id: 'gamuda-yenso',
    name: 'Cụm Sân Bóng Gamuda City - Yên Sở',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'TTTM Gamuda City – Công viên Yên Sở, Hoàng Mai, Hà Nội',
    lat: 20.9602,
    lng: 105.8589,
    phone: '0981523586',
    managerName: 'Anh Tùng Gamuda',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo cao cấp tiêu chuẩn khu đô thị sinh thái quốc tế',
    parkingFee: 'Bãi đỗ ô tô 100 xe miễn phí, xe máy miễn phí an ninh VIP',
    floodlight: 'Giàn đèn LED thể thao không chói mắt công nghệ châu Âu',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 195,
    amenities: ['Không khí trong lành công viên', 'Phòng thay đồ có vòi tắm sen', 'Khu vệ sinh sạch như khách sạn', 'Bình xịt lạnh']
  },
  {
    id: 'san364-giaiphong',
    name: 'Sân Bóng 364 Giải Phóng (Ga Giáp Bát)',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 364 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội',
    lat: 20.9795,
    lng: 105.8425,
    phone: '0904332468',
    managerName: 'Anh Tuấn Giáp Bát',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo chất lượng tốt, vị trí thuận tiện trục Giải Phóng',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.6,
    reviewCount: 110,
    amenities: ['Căng tin giải khát', 'Tắm tráng sạch', 'Bình xịt lạnh']
  },
  {
    id: 'daikim',
    name: 'Sân Bóng Đại Kim',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 168 Nguyễn Công Thái, KĐT Đại Kim, Hoàng Mai, Hà Nội',
    lat: 20.9725,
    lng: 105.8285,
    phone: '0983198683',
    managerName: 'Anh Dũng Đại Kim',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo êm chân, sợi cỏ đều, thoát nước cực tốt',
    parkingFee: 'Bãi đỗ ô tô 50 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED 800W bảo đảm tầm nhìn tối ưu',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 135,
    amenities: ['Tắm nóng lạnh', 'Căng tin đồ uống', 'Bình xịt y tế', 'Bóng thi đấu chuẩn']
  },
  {
    id: 'linhdam',
    name: 'Cụm Sân Bóng Bán Đảo Linh Đàm',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Khu đô thị Tây Nam Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội',
    lat: 20.9654,
    lng: 105.8245,
    phone: '0979112233',
    managerName: 'Anh Thành Linh Đàm',
    totalSubPitches: 8,
    turfType: 'Cỏ nhân tạo kim cương mới nâng cấp, mặt sân bằng phẳng',
    parkingFee: 'Bãi đỗ ô tô 80 xe thoải mái (30k), xe máy 5k có camera',
    floodlight: 'Hệ thống đèn cao áp 1000W sáng khắp 8 sân',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 230,
    amenities: ['Khu vực ven hồ thoáng đãng', 'Tắm nóng lạnh', 'Wifi miễn phí', 'Tủ sạc pin điện thoại', 'Căng tin giải khát']
  },
  {
    id: 'linhnam',
    name: 'Sân Bóng Đá Lĩnh Nam',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 74 Thúy Lĩnh, Lĩnh Nam, Hoàng Mai, Hà Nội',
    lat: 20.9795,
    lng: 105.8741,
    phone: '0967779923',
    managerName: 'Anh Vũ Lĩnh Nam',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo chất lượng cao, bề mặt thoát nước tức thì',
    parkingFee: 'Bãi xe ô tô cực rộng không giới hạn (Miễn phí)',
    floodlight: 'Hệ thống đèn cao áp sáng rõ từng đường bóng',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 75,
    amenities: ['Bãi xe cực lớn cho cả đội đi ô tô', 'Nước giải khát ướp lạnh', 'Áo bib thi đấu']
  },
  {
    id: 'denlu1',
    name: 'Sân Bóng Đền Lừ 1',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Ngã ba Đền Lừ, Tân Mai, Hoàng Mai, Hà Nội',
    lat: 20.9832,
    lng: 105.8521,
    phone: '0856777779',
    managerName: 'BQL Sân Đền Lừ',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo êm chân, view hồ Đền Lừ thoáng đãng',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED 800W sáng đều',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 115,
    amenities: ['Gió hồ mát mẻ', 'Trà đá giải khát', 'Tắm nóng lạnh', 'Bình xịt y tế']
  },
  {
    id: 'baolam',
    name: 'Sân Bóng Bảo Lâm (KCN Vĩnh Hưng)',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Khu công nghiệp Vĩnh Hưng, Hoàng Mai, Hà Nội',
    lat: 20.9885,
    lng: 105.8725,
    phone: '0989301081',
    managerName: 'Anh Lâm',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào chất lượng tốt, bề mặt phẳng',
    parkingFee: 'Bãi đỗ ô tô và xe máy rộng rãi thoải mái (Miễn phí)',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.5,
    reviewCount: 65,
    amenities: ['Bãi xe cực rộng', 'Trà đá nước ngọt', 'Bình xịt lạnh']
  },
  {
    id: 'vinhhung226',
    name: 'Sân Bóng Đá 226 Vĩnh Hưng',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 226 Vĩnh Hưng, Hoàng Mai, Hà Nội',
    lat: 20.9912,
    lng: 105.8785,
    phone: '0964541688',
    managerName: 'Chú Dũng 226',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, độ bám sân tốt',
    parkingFee: 'Xe máy 5k, ô tô đỗ ven đường miễn phí',
    floodlight: 'Đèn LED sáng chuẩn phủi',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 62,
    amenities: ['Trà đá căng tin sạch', 'Bình xịt lạnh y tế', 'Bóng Động Lực']
  },
  {
    id: 'hodenlu3',
    name: 'Sân Bóng Hồ Đền Lừ 3',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Ngã ba Tân Mai, cạnh hồ Đền Lừ, Hoàng Mai, Hà Nội',
    lat: 20.9845,
    lng: 105.8545,
    phone: '0904968787',
    managerName: 'Anh Kiên Đền Lừ',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, ven hồ thoáng gió',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô 30k',
    floodlight: 'Đèn LED 800W',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 78,
    amenities: ['Trà đá giải khát', 'Tắm tráng sạch', 'Áo bib thi đấu']
  },
  {
    id: 'quandoi-hoangmai',
    name: 'Sân Bóng Quân Đội Hoàng Mai',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Số 1 ngõ 299 Hoàng Mai, Mai Động, Hoàng Mai, Hà Nội',
    lat: 20.9865,
    lng: 105.8615,
    phone: '0908628555',
    managerName: 'Đại Diện BQL Quân Đội',
    totalSubPitches: 4,
    turfType: 'Mặt cỏ sân quân đội bền bỉ, an ninh cao',
    parkingFee: 'Khu gửi xe an toàn tuyệt đối (5k/xe máy)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.6,
    reviewCount: 70,
    amenities: ['An ninh tuyệt đối', 'Nước uống giải khát', 'Bình xịt y tế']
  },

  // ================= 9. QUẬN HAI BÀ TRƯNG =================
  {
    id: 'bachkhoa',
    name: 'Sân Bóng Đá ĐH Bách Khoa Hà Nội',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Khu liên hiệp thể thao Bách Khoa, Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
    lat: 21.0042,
    lng: 105.8451,
    phone: '02438680186',
    managerName: 'Thầy Hùng Thể Thao BK',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ nhân tạo cụm sân trường đại học kỹ thuật hàng đầu',
    parkingFee: 'Bãi xe khuôn viên ký túc xá rộng rãi an toàn (5k)',
    floodlight: 'Giàn đèn thi đấu chuyên nghiệp',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 22:30',
    rating: 4.8,
    reviewCount: 205,
    amenities: ['Khán đài có mái che', 'Tắm nóng lạnh sạch sẽ', 'Máy bán nước tự động', 'Tủ sạc pin thoại']
  },
  {
    id: 'vinhtuy30',
    name: 'Sân Bóng Vĩnh Tuy 30',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Ngõ 122 Vĩnh Tuy, Hai Bà Trưng, Hà Nội',
    lat: 20.9985,
    lng: 105.8695,
    phone: '0833439999',
    managerName: 'Anh Thắng Vĩnh Tuy',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo êm chân, bề mặt thoát nước nhanh khi mưa',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED 800W sáng đều',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 120,
    amenities: ['Căng tin giải khát', 'Tắm nóng lạnh', 'Bình xịt lạnh', 'Áo bib thi đấu']
  },
  {
    id: 'sportland-vinhtuy',
    name: 'Sân Bóng Sportland Vĩnh Tuy',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Số 25 ngõ 122 Vĩnh Tuy, Hai Bà Trưng, Hà Nội',
    lat: 20.9975,
    lng: 105.8712,
    phone: '0359984845',
    managerName: 'BQL Sportland',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi đay mới, lót cao su chống xước',
    parkingFee: 'Bãi ô tô 25 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED thể thao 800W',
    priceRange: '600.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 88,
    amenities: ['Trà đá nước ngọt', 'Tắm tráng sạch', 'Bình xịt y tế']
  },
  {
    id: 'thanhnhan',
    name: 'Sân Bóng Thanh Nhàn',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Đối diện số 187 Thanh Nhàn, Hai Bà Trưng, Hà Nội',
    lat: 21.0085,
    lng: 105.8565,
    phone: '0984420372',
    managerName: 'Anh Long Thanh Nhàn',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào, vị trí trung tâm quận',
    parkingFee: 'Bãi xe máy rộng (5k), ô tô đỗ đường lớn',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 95,
    amenities: ['Căng tin đồ uống', 'Tắm tráng sạch sẽ', 'Bình xịt lạnh']
  },
  {
    id: 'haibatrung',
    name: 'Sân Bóng Hai Bà Trưng (Nguyễn An Ninh)',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Ngõ 104 Nguyễn An Ninh, Trương Định, Hai Bà Trưng, Hà Nội',
    lat: 20.9935,
    lng: 105.8445,
    phone: '0964434433',
    managerName: 'Anh Hưng',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, bề mặt êm chân',
    parkingFee: 'Xe máy 5k, ô tô 30k',
    floodlight: 'Đèn LED 800W',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 85,
    amenities: ['Trà đá vỉa hè', 'Bình xịt y tế', 'Áo bib 2 màu']
  },
  {
    id: 'minhkiet-daila',
    name: 'Sân Bóng Minh Kiệt (Đại La)',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Số 44 Đại La, Đồng Tâm, Hai Bà Trưng, Hà Nội',
    lat: 20.9982,
    lng: 105.8468,
    phone: '0964434433',
    managerName: 'BQL Sân Minh Kiệt',
    totalSubPitches: 3,
    turfType: 'Mặt cỏ trong khuôn viên trường học, bằng phẳng',
    parkingFee: 'Gửi xe trong trường an toàn (5k)',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 65,
    amenities: ['An ninh tốt', 'Trà đá giải khát', 'Bình xịt lạnh']
  },
  {
    id: 'kinhtequocdan',
    name: 'Sân Bóng ĐH Kinh Tế Quốc Dân (NEU)',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Đường Trần Đại Nghĩa, Đồng Tâm, Hai Bà Trưng, Hà Nội',
    lat: 20.9985,
    lng: 105.8425,
    phone: '0973114422',
    managerName: 'Thầy Quang NEU',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi đôi cao cấp, mặt sân bằng phẳng',
    parkingFee: 'Nhà để xe trường NEU hiện đại an ninh (5k)',
    floodlight: 'Đèn LED thể thao 800W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 140,
    amenities: ['Phòng thay đồ có quạt', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Căng tin đồ uống']
  },
  {
    id: 'tuoitre',
    name: 'Sân Bóng Công Viên Tuổi Trẻ',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Số 46 Thanh Nhàn, Hai Bà Trưng, Hà Nội',
    lat: 21.0075,
    lng: 105.8555,
    phone: '0984420372',
    managerName: 'BQL Sân Tuổi Trẻ',
    totalSubPitches: 4,
    turfType: 'Sân nằm trong công viên nhiều cây xanh thoáng mát',
    parkingFee: 'Bãi xe công viên rộng (30k/5k)',
    floodlight: 'Đèn LED 800W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 22:30',
    rating: 4.6,
    reviewCount: 90,
    amenities: ['Không gian công viên mát mẻ', 'Trà đá giải khát', 'Tắm tráng sạch']
  },

  // ================= 10. QUẬN LONG BIÊN =================
  {
    id: 'duongsat-longbien',
    name: 'Sân Bóng Đá Đường Sắt Long Biên',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 2 ngõ 167 Gia Quất, Thượng Thanh, Long Biên, Hà Nội',
    lat: 21.0495,
    lng: 105.8745,
    phone: '0911371801',
    managerName: 'Anh Long Đường Sắt',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi đay mới thay, mặt sân bằng phẳng êm chân',
    parkingFee: 'Bãi đỗ ô tô 40 xe (20k), xe máy 5k',
    floodlight: 'Dàn đèn LED thể thao 800W sáng đều sân',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 125,
    amenities: ['Không gian cực kỳ thoáng mát', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Áo bib thi đấu']
  },
  {
    id: 'longbien-phuctan',
    name: 'Sân Bóng Long Biên (Phúc Tân)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 1 Phúc Tân – 301 Hồng Hà, Long Biên, Hà Nội',
    lat: 21.0425,
    lng: 105.8565,
    phone: '0969799235',
    managerName: 'Anh Tuấn Phúc Tân',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, bám giày đinh TF',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED cao áp sáng chuẩn',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 95,
    amenities: ['Gió sông Hồng mát rượi', 'Trà đá nước mía', 'Bình xịt lạnh']
  },
  {
    id: 'phuvien-138',
    name: 'Sân Bóng 138 Phú Viên (Bồ Đề)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 138 Phú Viên, Bồ Đề, Long Biên, Hà Nội',
    lat: 21.0345,
    lng: 105.8655,
    phone: '0328875038',
    managerName: 'Anh Hùng Phú Viên',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo ven đê sông Hồng cực mát',
    parkingFee: 'Bãi đỗ xe ô tô 30 xe (20k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 22:30',
    rating: 4.6,
    reviewCount: 88,
    amenities: ['Gió sông tự nhiên', 'Tắm tráng sạch', 'Trà đá giải khát']
  },
  {
    id: 'phuvien-302',
    name: 'Sân Bóng 302 Phú Viên',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 302 Phú Viên, Bồ Đề, Long Biên, Hà Nội',
    lat: 21.0315,
    lng: 105.8685,
    phone: '0944341979',
    managerName: 'Anh Sơn Bồ Đề',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo hạt cao su đen đàn hồi tốt',
    parkingFee: 'Bãi đỗ xe thoải mái miễn phí',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 72,
    amenities: ['Bãi xe rộng', 'Trà đá nước ngọt', 'Bình xịt chấn thương']
  },
  {
    id: 'vende-4',
    name: 'Sân Bóng Ven Đê 4 (Số 8 Bồ Đề)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 8 Phố Bồ Đề, Long Biên, Hà Nội',
    lat: 21.0365,
    lng: 105.8625,
    phone: '0333186666',
    managerName: 'Anh Chiến Ven Đê',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo mới thay, độ nảy bóng tốt',
    parkingFee: 'Bãi đỗ ô tô 35 xe (20k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 110,
    amenities: ['Ven đê thoáng gió', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Áo bib thi đấu']
  },
  {
    id: 'nguyenson',
    name: 'Sân Bóng Nguyễn Sơn (Gia Thụy)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 360 Nguyễn Văn Cừ, Gia Thụy, Long Biên, Hà Nội',
    lat: 21.0455,
    lng: 105.8815,
    phone: '0912234567',
    managerName: 'Anh Đức Nguyễn Sơn',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi kim cương, mặt sân bằng phẳng',
    parkingFee: 'Bãi đỗ ô tô 40 xe (20k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 105,
    amenities: ['Vị trí đắc địa trục Nguyễn Văn Cừ', 'Tắm tráng sạch', 'Trà đá cà phê']
  },
  {
    id: 'vinhomes-riverside',
    name: 'Sân Bóng Vinhomes Riverside',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Khu đô thị Vinhomes Riverside, Phúc Lợi, Long Biên, Hà Nội',
    lat: 21.0485,
    lng: 105.9085,
    phone: '0969089999',
    managerName: 'BQL Thể Thao Riverside',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ chất lượng cao cấp tiêu chuẩn khu đô thị sinh thái Vinhomes',
    parkingFee: 'Bãi đỗ ô tô và xe máy rộng rãi an ninh VIP 24/7 (Miễn phí)',
    floodlight: 'Hệ thống đèn LED thể thao chuẩn quốc tế',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 175,
    amenities: ['Khuôn viên sinh thái đẳng cấp', 'Phòng thay đồ VIP', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Bảo vệ an ninh 24/7']
  },
  {
    id: 'tinlon-bode',
    name: 'Sân Bóng Tin Lớn (Bồ Đề)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Khu vực Bồ Đề, Long Biên, Hà Nội',
    lat: 21.0355,
    lng: 105.8645,
    phone: '0904512267',
    managerName: 'Anh Tin Bồ Đề',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, phong trào đá nhiệt',
    parkingFee: 'Xe máy 5k, ô tô 20k',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 68,
    amenities: ['Trà đá vỉa hè', 'Bình xịt giảm đau', 'Cho mượn áo tập']
  },
  {
    id: 'chuongduong',
    name: 'Sân Bóng Chương Dương (Bồ Đề)',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Phường Bồ Đề (gần chân cầu Chương Dương), Long Biên, Hà Nội',
    lat: 21.0385,
    lng: 105.8615,
    phone: '0988169439',
    managerName: 'Anh Dương',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo chất lượng tốt, gần cầu Chương Dương tiện qua lại',
    parkingFee: 'Bãi ô tô 30 xe (20k), xe máy 5k',
    floodlight: 'Đèn cao áp sáng tốt',
    priceRange: '550.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 90,
    amenities: ['Tiện qua cầu Chương Dương', 'Tắm tráng sạch', 'Trà đá giải khát']
  },
  {
    id: 'aimo',
    name: 'Sân Bóng Đá Ái Mộ',
    district: 'LongBien',
    districtLabel: 'Long Biên',
    address: 'Số 99 Ái Mộ, Ngọc Thụy, Long Biên, Hà Nội',
    lat: 21.0465,
    lng: 105.8695,
    phone: '0904397766',
    managerName: 'Anh Hưng Ái Mộ',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo êm chân, không gian yên tĩnh',
    parkingFee: 'Bãi đỗ xe máy rộng (5k), ô tô 20k',
    floodlight: 'Đèn LED 800W',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 82,
    amenities: ['Trà đá nước ngọt', 'Bình xịt lạnh', 'Áo bib thi đấu']
  }
];

export const PitchMapSection: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPitchId, setSelectedPitchId] = useState<string>('khongquan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tính năng chủ kèo dán link Google Maps tùy chỉnh
  const [hostCustomGmapsLink, setHostCustomGmapsLink] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredPitches = useMemo(() => {
    return HANOI_PITCHES.filter((p) => {
      const matchDistrict = selectedDistrict === 'all' || p.district === selectedDistrict;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.address.toLowerCase().includes(q) ||
        p.districtLabel.toLowerCase().includes(q);
      const matchAmenity = amenityFilter === 'all' || 
        p.amenities.some(a => a.toLowerCase().includes(amenityFilter.toLowerCase())) ||
        (amenityFilter === 'oto' && p.parkingFee.toLowerCase().includes('ô tô'));
      return matchDistrict && matchSearch && matchAmenity;
    });
  }, [selectedDistrict, searchQuery, amenityFilter]);

  const activePitch = useMemo(() => {
    return HANOI_PITCHES.find((p) => p.id === selectedPitchId) || filteredPitches[0] || HANOI_PITCHES[0];
  }, [selectedPitchId, filteredPitches]);

  // Link Google Maps dẫn đường chuẩn xác (bằng thẻ a rel noopener để KHÔNG BAO GIỜ bị chặn popup)
  const computedDirectionsUrl = useMemo(() => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activePitch.name} ${activePitch.address}`)}`;
  }, [activePitch]);

  // Link Test Google Maps của ô nhập tùy chỉnh
  const computedTestGmapsUrl = useMemo(() => {
    let custom = hostCustomGmapsLink.trim();
    if (custom) {
      if (!custom.startsWith('http://') && !custom.startsWith('https://')) {
        custom = 'https://' + custom;
      }
      return custom;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activePitch.name} ${activePitch.address}`)}`;
  }, [hostCustomGmapsLink, activePitch]);

  // Sao chép vị trí và cú pháp tin nhắn Zalo gửi cả đội
  const handleShareZaloLocation = (pitch: PitchData) => {
    const gmapsUrl = hostCustomGmapsLink.trim() !== '' 
      ? (hostCustomGmapsLink.startsWith('http') ? hostCustomGmapsLink : `https://${hostCustomGmapsLink}`)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pitch.name} ${pitch.address}`)}`;

    const text = 
      `📍 VỊ TRÍ SÂN BÓNG HÔM NAY:\n` +
      `• Sân: ${pitch.name}\n` +
      `• Địa chỉ: ${pitch.address}\n` +
      `• Bãi xe: ${pitch.parkingFee}\n` +
      `• Hotline sân: ${pitch.phone} (${pitch.managerName})\n` +
      `• Google Maps chỉ đường: ${gmapsUrl}\n` +
      `👉 Anh em đến sớm 15 phút khởi động nhé!`;

    navigator.clipboard.writeText(text);
    showToast('✅ Đã sao chép vị trí Google Maps để dán vào nhóm Zalo đội!');
  };

  // URL nhúng Google Maps iframe miễn phí không cần API key
  const googleMapsEmbedUrl = useMemo(() => {
    const query = encodeURIComponent(`${activePitch.name} ${activePitch.address}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [activePitch]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-stone-900">
      
      {/* HEADER WIDGET: BẢN ĐỒ CỤM SÂN BÓNG ĐÁ HÀ NỘI (VINTAGE RETRO STYLE) */}
      <div className="card-retro-paper relative overflow-hidden rounded-3xl border border-stone-300 p-4 sm:p-5 shadow-lg">
        <div className="washi-tape -top-2.5 left-8 rotate-[-2deg]" />
        <div className="washi-tape -top-2.5 right-8 rotate-[2deg]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-3.5 relative z-10 pt-1">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-inner font-black shrink-0">
              <MapPin className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-stone-900">Bản Đồ Cụm Sân Bóng Phủi Hà Nội</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {HANOI_PITCHES.length} Cụm Sân Tuyển Chọn
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-medium max-w-md">
                Bản đồ Google Maps tương tác trực tiếp • Chỉ đường bằng giọng nói 1-chạm • Bãi đỗ ô tô &amp; Hotline đặt sân
              </p>
            </div>
          </div>

          {/* 📰 TƯ LIỆU SA BÀN & CÚP PHỦI THỰC TẾ TỪ ẢNH 2 */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <VintageScrapbookAsset
              asset="tactical-board"
              tape="left"
              tilt={-2}
              className="w-24 lg:w-28 shadow-sm"
              caption="Sa bàn 3-2-1"
            />
            <VintageScrapbookAsset
              asset="trophy-badge"
              tape="right"
              tilt={1.5}
              className="w-24 lg:w-28 shadow-sm"
              caption="Hà Nội Phủi"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={computedDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ticket-stub px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Chỉ Đường Sân Đang Chọn</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* THANH TÌM KIẾM NHANH SÂN BÓNG */}
        <div className="pt-3 flex flex-col sm:flex-row gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sân (Phòng Không, Kim Giang, Định Công, Linh Đàm, Thành Phát...), đường phố..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
            />
          </div>

          {/* Lọc nhanh tiện ích */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Tất cả tiện ích' },
              { id: 'oto', label: '🚗 Có Bãi Ô Tô' },
              { id: 'Tắm nóng lạnh', label: '🚿 Tắm nóng lạnh' },
              { id: 'Trọng tài', label: '⚖️ Có Trọng tài' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAmenityFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                  amenityFilter === f.id
                    ? 'bg-stone-900 text-white font-black border-stone-900 shadow-sm'
                    : 'bg-[#ede8dc] border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* DISTRICT FILTER CHIPS - ĐẦY ĐỦ CÁC QUẬN TRỌNG ĐIỂM */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 text-xs relative z-10">
          <span className="text-stone-700 text-[11px] font-bold shrink-0 mr-1 flex items-center">
            <MapPin className="w-3 h-3 text-red-600 mr-0.5" /> Khu vực:
          </span>
          {[
            { id: 'all', label: 'Tất cả Hà Nội' },
            { id: 'CauGiay', label: 'Cầu Giấy' },
            { id: 'ThanhXuan', label: 'Thanh Xuân' },
            { id: 'NamTuLiem', label: 'Nam Từ Liêm' },
            { id: 'BacTuLiem', label: 'Bắc Từ Liêm' },
            { id: 'DongDa', label: 'Đống Đa' },
            { id: 'HaDong', label: 'Hà Đông' },
            { id: 'HoangMai', label: 'Hoàng Mai' },
            { id: 'HaiBaTrung', label: 'Hai Bà Trưng' },
            { id: 'BaDinh', label: 'Ba Đình' },
            { id: 'TayHo', label: 'Tây Hồ' },
            { id: 'LongBien', label: 'Long Biên' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all border ${
                selectedDistrict === d.id 
                  ? 'bg-stone-900 text-white font-black border-stone-900 shadow-sm' 
                  : 'bg-[#ede8dc] text-stone-700 border-stone-300 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* TÍNH NĂNG CHỦ KÈO TÍCH HỢP VỊ TRÍ GOOGLE MAPS */}
      <div className="card-retro-paper p-3.5 rounded-2xl border border-stone-300 space-y-2 shadow-sm text-stone-900 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-black text-stone-900">Chủ Kèo Được Tích Hợp Vị Trí Lên Google Maps</span>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
            Chỉ Đường 1-Chạm
          </span>
        </div>

        <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
          Đội chủ nhà khi tạo kèo có thể dán link ghim Google Maps hoặc hệ thống sẽ tự động tạo link dẫn đường chuẩn xác từ Tên sân + Địa chỉ bạn điền. Đối thủ bấm vào là mở Google Maps dẫn đường ngay.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={hostCustomGmapsLink}
            onChange={(e) => setHostCustomGmapsLink(e.target.value)}
            placeholder="Dán link Google Maps hoặc để trống để định vị theo cụm sân đang chọn"
            className="flex-1 bg-[#fbf9f4] border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:outline-none font-mono"
          />
          <a
            href={computedTestGmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ticket-stub px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center space-x-1.5 transition-all shadow cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Test Link Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* DANH SÁCH CỤM SÂN & BẢN ĐỒ CHI TIẾT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cột trái: Danh sách các cụm sân */}
        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-stone-600">
            <span>Tìm thấy {filteredPitches.length} cụm sân</span>
            <span>Bấm để xem chi tiết</span>
          </div>
          {filteredPitches.map(pitch => {
            const isSelected = pitch.id === activePitch.id;
            return (
              <div
                key={pitch.id}
                onClick={() => setSelectedPitchId(pitch.id)}
                className={`card-retro-paper p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-emerald-700 bg-emerald-50/50 shadow-md ring-1 ring-emerald-700/30' 
                    : 'border-stone-300 hover:border-stone-400 hover:bg-[#f5f2e9]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <h3 className={`text-xs truncate ${isSelected ? 'text-emerald-900 font-black' : 'text-stone-900 font-bold'}`}>
                      {pitch.name}
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-0.5 flex items-center">
                      <MapPin className="w-3 h-3 text-red-600 mr-1 shrink-0" />
                      <span className="truncate">{pitch.address}</span>
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede8dc] text-stone-700 font-bold shrink-0 border border-stone-300">
                    {pitch.totalSubPitches} sân 7
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-600 mt-2 pt-2 border-t border-stone-200">
                  <span className="text-emerald-800 font-bold truncate max-w-[170px]">
                    {pitch.parkingFee.split('(')[0]}
                  </span>
                  <span className="text-amber-700 font-black shrink-0">
                    ★ {pitch.rating}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredPitches.length === 0 && (
            <div className="card-retro-paper p-6 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-600">
              Không tìm thấy cụm sân phù hợp với bộ lọc. Hãy thử chọn quận khác hoặc xóa từ khóa tìm kiếm.
            </div>
          )}
        </div>

        {/* Cột phải: Khung bản đồ Google Maps trực tiếp & Thông số cụm sân đang chọn */}
        <div className="md:col-span-2 space-y-3">
          
          {/* 1. MÀN HÌNH BẢN ĐỒ GOOGLE MAPS TƯƠNG TÁC THẬT 100% */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 shadow-lg flex flex-col justify-between">
            <iframe
              title={`Google Maps ${activePitch.name}`}
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Floating Top Badge */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] bg-white/95 backdrop-blur-md text-stone-900 font-black px-2.5 py-1 rounded-lg border border-stone-300 shadow flex items-center gap-1.5 pointer-events-auto">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{activePitch.name}</span>
              </span>
              <span className="text-[11px] bg-stone-900 text-white font-black px-2.5 py-1 rounded-lg shadow pointer-events-auto">
                {activePitch.districtLabel}
              </span>
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-stone-300 flex items-center justify-between gap-2 shadow-lg">
              <div className="truncate text-xs">
                <span className="font-black text-stone-900 block truncate">{activePitch.name}</span>
                <span className="text-[11px] text-stone-600 truncate block font-medium">{activePitch.address}</span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShareZaloLocation(activePitch)}
                  className="ticket-stub px-2.5 py-1.5 bg-[#ede8dc] hover:bg-stone-200 text-stone-800 rounded-lg border border-stone-300 transition-all flex items-center space-x-1"
                  title="Gửi vị trí Zalo"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-bold text-[11px]">Copy Zalo</span>
                </button>
                <a
                  href={computedDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ticket-stub px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg font-black text-[11px] shadow flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mở Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          </div>

          {/* 2. THÔNG SỐ KỸ THUẬT & DỊCH VỤ THỰC TẾ CỦA CỤM SÂN */}
          <div className="card-retro-paper border border-stone-300 rounded-2xl p-4 space-y-3 text-xs text-stone-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-2.5 gap-1.5">
              <div>
                <span className="font-black text-stone-900 text-sm">Thông Số Kỹ Thuật &amp; Bãi Đỗ Xe Thực Tế</span>
                <div className="text-[11px] text-stone-600 mt-0.5 flex items-center gap-2">
                  <span className="text-amber-700 font-bold">★ {activePitch.rating}/5.0 ({activePitch.reviewCount} đánh giá)</span>
                  <span>•</span>
                  <span>{activePitch.openingHours}</span>
                </div>
              </div>
              <span className="text-stone-700 font-mono text-[11px] bg-[#ede8dc] px-2.5 py-1 rounded-lg border border-stone-300">
                Quản lý: <strong className="text-emerald-800 font-bold">{activePitch.managerName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700">
              <div className="bg-[#ede8dc] p-2.5 rounded-xl border border-stone-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-bold">Mặt cỏ sân 7:</strong>
                  <span>{activePitch.turfType}</span>
                </div>
              </div>

              <div className="bg-[#ede8dc] p-2.5 rounded-xl border border-stone-200 flex items-start space-x-2">
                <Car className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-bold">Bãi đỗ ô tô &amp; xe máy:</strong>
                  <span>{activePitch.parkingFee}</span>
                </div>
              </div>

              <div className="bg-[#ede8dc] p-2.5 rounded-xl border border-stone-200 flex items-start space-x-2">
                <Zap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-bold">Hệ thống chiếu sáng:</strong>
                  <span>{activePitch.floodlight}</span>
                </div>
              </div>

              <div className="bg-[#ede8dc] p-2.5 rounded-xl border border-stone-200 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-bold">Giá thuê tham khảo:</strong>
                  <span className="text-red-700 font-black">{activePitch.priceRange}</span>
                </div>
              </div>
            </div>

            {/* Hotline gọi trực tiếp */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-900">Hotline quản lý đặt sân:</div>
                  <div className="text-[10px] text-stone-600">Gọi xác nhận trống sân ca 17:30, 19:00, 20:30</div>
                </div>
              </div>
              <a
                href={`tel:${activePitch.phone}`}
                className="ticket-stub px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 shadow transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>{activePitch.phone}</span>
              </a>
            </div>

            {/* Danh sách tiện ích có sẵn tại sân */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                Tiện ích thực tế có sẵn tại cụm sân:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePitch.amenities.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-[#ede8dc] border border-stone-300 text-stone-700 rounded-lg text-[10px] flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PitchMapSection;
