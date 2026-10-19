// components/pitch/PitchMapSection.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Navigation, Phone, Car, Zap, 
  Sparkles, Share2, CheckCircle2, 
  Compass, Search, Clock,
  ExternalLink, Check
} from 'lucide-react';

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
  // ================= QUẬN THANH XUÂN =================
  {
    id: 'khongquan',
    name: 'Sân Bóng Phòng Không - Không Quân',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngõ 168 Lê Trọng Tấn, Khương Mai, Thanh Xuân, Hà Nội',
    lat: 20.9982,
    lng: 105.8315,
    phone: '0989332211',
    managerName: 'Anh Chiến',
    totalSubPitches: 7,
    turfType: 'Mặt sân quân đội chuẩn quốc gia, cỏ nhân tạo 50mm giảm chấn',
    parkingFee: 'Khu đỗ xe quân sự cực an ninh, ô tô 30k, xe máy 5k',
    floodlight: 'Hệ thống đèn LED thể thao cao cấp không sấp bóng',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 220,
    amenities: ['Khu an ninh bảo vệ nghiêm ngặt', 'Tắm nóng lạnh', 'Căng tin đồ uống phong phú', 'Áo bib chuẩn', 'Băng ghế dự bị có mái che']
  },
  {
    id: 'kimgiang',
    name: 'Sân Bóng Đá Kim Giang (Thanh Xuân)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngõ 64 Kim Giang, Khương Đình, Thanh Xuân, Hà Nội',
    lat: 20.9855,
    lng: 105.8182,
    phone: '0936112233',
    managerName: 'Chú Bình',
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
    id: 'viettel1',
    name: 'Sân Bóng Đá Viettel 1 (Trường Chinh)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Ngõ 155 Trường Chinh, Khương Mai, Thanh Xuân, Hà Nội',
    lat: 20.9995,
    lng: 105.8354,
    phone: '0978665544',
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
    id: 'thuongdinh',
    name: 'Sân Bóng Đá Thượng Đình (Nguyễn Trãi)',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Số 129 Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    lat: 20.9961,
    lng: 105.8142,
    phone: '0912889900',
    managerName: 'Anh Hoàng',
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
    id: 'bocongan-nguyenxien',
    name: 'Sân Bóng Bộ Công An - Nguyễn Xiển',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Đường Nguyễn Xiển (gần ngã tư Khuất Duy Tiến), Thanh Xuân, Hà Nội',
    lat: 20.9912,
    lng: 105.8085,
    phone: '0943221199',
    managerName: 'Anh Tuấn Anh',
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
    address: 'Ngõ 29 Khương Hạ, Khương Đình, Thanh Xuân, Hà Nội',
    lat: 20.9888,
    lng: 105.8215,
    phone: '0965113355',
    managerName: 'Bác Thắng',
    totalSubPitches: 3,
    turfType: 'Cỏ nhân tạo phong trào lót cao su êm ái',
    parkingFee: 'Xe máy 5k, ô tô đỗ ngõ rộng miễn phí',
    floodlight: 'Đèn LED 600W sáng đều mặt sân',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.4,
    reviewCount: 60,
    amenities: ['Trà đá nước ngọt mát lạnh', 'Bình xịt lạnh', 'Cho mượn bóng và áo tập']
  },
  {
    id: 'c500-anninh',
    name: 'Cụm Sân Bóng C500 - Học Viện An Ninh',
    district: 'ThanhXuan',
    districtLabel: 'Thanh Xuân',
    address: 'Đường 19/5 (giáp ranh Nguyễn Trãi - Thanh Xuân), Hà Nội',
    lat: 20.9812,
    lng: 105.7925,
    phone: '0984556677',
    managerName: 'Thầy Đức Quản Lý',
    totalSubPitches: 8,
    turfType: 'Cụm sân phủi huyền thoại sinh viên và phủi Hà Thành',
    parkingFee: 'Bãi đỗ ô tô 80 xe (30k), xe máy 5k trong khuôn viên trường',
    floodlight: 'Hệ thống đèn cao áp chuyên nghiệp cho 8 sân cùng lúc',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 310,
    amenities: ['Khán đài rộng rãi', 'Căng tin đồ uống phong phú', 'Tắm nóng lạnh', 'Bình xịt y tế', 'Tủ sạc điện thoại']
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
    managerName: 'Anh Quyết',
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

  // ================= QUẬN HOÀNG MAI =================
  {
    id: 'dinhcong',
    name: 'Cụm Sân Bóng Đá Định Công',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Khu đô thị Định Công (gần cầu Dậu), Hoàng Mai, Hà Nội',
    lat: 20.9782,
    lng: 105.8312,
    phone: '0982554433',
    managerName: 'Anh Quang',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo sợi đôi cao cấp, hạt cao su trải đều giảm chấn',
    parkingFee: 'Bãi xe ô tô cực rộng chứa 50 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W sáng rõ như ban ngày',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 175,
    amenities: ['Căng-tin trà đá quạt hơi nước', 'Bình xịt lạnh chấn thương', 'Tắm nóng lạnh', 'Bóng thi đấu chuẩn FIFA']
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
    id: 'tanmai',
    name: 'Sân Bóng Đá Tân Mai',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Ngõ 147 Tân Mai, Hoàng Mai, Hà Nội',
    lat: 20.9832,
    lng: 105.8521,
    phone: '0934112299',
    managerName: 'Anh Kiên',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo sợi đay êm ái, bám giày đinh dăm',
    parkingFee: 'Bãi đỗ ô tô 20 xe (30k), xe máy 5k',
    floodlight: 'Đèn LED 800W bảo đảm tầm nhìn ban đêm',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.6,
    reviewCount: 88,
    amenities: ['Trà đá nước ngọt mát lạnh', 'Bình xịt lạnh y tế', 'Cho thuê áo bib 2 màu']
  },
  {
    id: 'gamuda-yenso',
    name: 'Cụm Sân Bóng Gamuda City - Yên Sở',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Khuôn viên Công viên Yên Sở, Gamuda City, Hoàng Mai, Hà Nội',
    lat: 20.9602,
    lng: 105.8589,
    phone: '0987661122',
    managerName: 'Anh Tùng Gamuda',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo cao cấp tiêu chuẩn khu đô thị sinh thái quốc tế',
    parkingFee: 'Bãi đỗ ô tô 100 xe miễn phí, xe máy miễn phí an ninh VIP',
    floodlight: 'Giàn đèn LED thể thao không chói mắt công nghệ châu Âu',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 190,
    amenities: ['Không khí trong lành công viên', 'Phòng thay đồ có vòi tắm sen', 'Khu vệ sinh sạch như khách sạn', 'Bình xịt lạnh']
  },
  {
    id: 'hoangmai-arena',
    name: 'Sân Bóng Hoàng Mai Arena (Lĩnh Nam)',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Đường Lĩnh Nam (gần cầu Thanh Trì), Hoàng Mai, Hà Nội',
    lat: 20.9795,
    lng: 105.8741,
    phone: '0945778899',
    managerName: 'Anh Vũ',
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
    id: 'vinhhung',
    name: 'Sân Bóng Đá Vĩnh Hưng',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Ngõ 321 Vĩnh Hưng, Hoàng Mai, Hà Nội',
    lat: 20.9912,
    lng: 105.8785,
    phone: '0966442211',
    managerName: 'Chú Dũng',
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
    id: 'damdoi',
    name: 'Sân Bóng Đá Đầm Đỗi (Lê Trọng Tấn kéo dài)',
    district: 'HoangMai',
    districtLabel: 'Hoàng Mai',
    address: 'Ngõ 192 Lê Trọng Tấn kéo dài, Định Công, Hoàng Mai, Hà Nội',
    lat: 20.9875,
    lng: 105.8291,
    phone: '0981335577',
    managerName: 'Anh Quân',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo sợi xoắn bền bỉ, giảm chấn va chạm',
    parkingFee: 'Bãi đỗ ô tô 40 xe (30k), xe máy 5k',
    floodlight: 'Dàn đèn LED 800W bảo đảm tầm nhìn tối ưu',
    priceRange: '550.000đ - 800.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.7,
    reviewCount: 115,
    amenities: ['Không gian ven hồ thoáng mát', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Băng dán cơ y tế']
  },

  // ================= QUẬN CẦU GIẤY =================
  {
    id: 'trungkinh',
    name: 'Sân Bóng Đá Trung Kính Hạ (Tú Mỡ)',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Ngõ 2 Tú Mỡ, P. Yên Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0118,
    lng: 105.7932,
    phone: '0983123456',
    managerName: 'Anh Tuấn Quản Lý',
    totalSubPitches: 6,
    turfType: 'Cỏ nhân tạo sợi đay cao cấp 50mm, lót cao su giảm chấn',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy miễn phí an ninh có thẻ',
    floodlight: 'Dàn đèn LED 800W sáng chuẩn không chói mắt hướng gôn',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '06:00 - 23:00',
    rating: 4.8,
    reviewCount: 142,
    amenities: ['Tắm nóng lạnh', 'Bình xịt lạnh y tế', 'Căng-tin trà đá', 'Cho thuê áo pitch', 'Wifi tốc độ cao']
  },
  {
    id: 'thanhphat',
    name: 'Cụm Sân Bóng Đá Thành Phát',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Số 2 Hoàng Minh Giám, Trung Hòa, Cầu Giấy, Hà Nội',
    lat: 21.0049,
    lng: 105.8015,
    phone: '0912445566',
    managerName: 'Anh Dũng',
    totalSubPitches: 8,
    turfType: 'Cỏ nhân tạo kim cương sợi xoắn tiêu chuẩn FIFA cơ sở',
    parkingFee: 'Bãi đỗ ô tô 50 xe (40k), xe máy 5k có bảo vệ 24/7',
    floodlight: 'Hệ thống 16 cột đèn cao áp độc lập, không góc tối',
    priceRange: '700.000đ - 950.000đ / trận 90 phút',
    openingHours: '05:30 - 23:30',
    rating: 4.9,
    reviewCount: 218,
    amenities: ['Phòng thay đồ có khóa', 'Nước điện giải ướp lạnh', 'Bình xịt giảm đau', 'Trọng tài theo yêu cầu', 'Khán đài theo dõi']
  },
  {
    id: 'dichvong',
    name: 'Sân Bóng Đá Dịch Vọng (Trần Thái Tông)',
    district: 'CauGiay',
    districtLabel: 'Cầu Giấy',
    address: 'Ngõ 45 Trần Thái Tông, Dịch Vọng, Cầu Giấy, Hà Nội',
    lat: 21.0321,
    lng: 105.7876,
    phone: '0988223344',
    managerName: 'Anh Nam',
    totalSubPitches: 5,
    turfType: 'Mặt cỏ nhân tạo mới thay 2025, độ đàn hồi cực tốt',
    parkingFee: 'Ô tô đỗ thoải mái 40 xe (30k), xe máy miễn phí',
    floodlight: 'Hệ thống đèn LED thể thao thế hệ mới 1000W',
    priceRange: '600.000đ - 850.000đ / trận 90 phút',
    openingHours: '06:00 - 22:30',
    rating: 4.7,
    reviewCount: 96,
    amenities: ['Căng tin giải khát', 'Tắm nóng lạnh', 'Bóng thi đấu Động Lực', 'Áo bib thi đấu 2 màu']
  },
  {
    id: 'd30-caugiay',
    name: 'Sân Bóng Đá Cầu Giấy (D30 Tôn Thất Thuyết)',
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
    managerName: 'Anh Tuấn',
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

  // ================= QUẬN NAM TỪ LIÊM =================
  {
    id: 'metri',
    name: 'Sân Bóng Đá Mễ Trì Hạ',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Mễ Trì Hạ (cách The Garden 200m), Nam Từ Liêm, Hà Nội',
    lat: 21.0152,
    lng: 105.7789,
    phone: '0977889911',
    managerName: 'Anh Cường',
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
    id: 'dinhthon',
    name: 'Sân Bóng Đá Đình Thôn',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Ngõ 39 Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    lat: 21.0175,
    lng: 105.7745,
    phone: '0944556677',
    managerName: 'Anh Hải',
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
    id: 'tanmy',
    name: 'Cụm Sân Vận Động Tân Mỹ (Mỹ Đình)',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Lê Đức Thọ kéo dài (sau SVĐ Mỹ Đình), Nam Từ Liêm, Hà Nội',
    lat: 21.0289,
    lng: 105.7634,
    phone: '0981992288',
    managerName: 'Anh Bách',
    totalSubPitches: 10,
    turfType: 'Cụm sân quy mô lớn chuẩn tổ chức các giải phủi HPL',
    parkingFee: 'Bãi ô tô cực đại sức chứa 150 xe (30k), xe máy 5k',
    floodlight: 'Hệ thống giàn đèn chuyên nghiệp chiếu sáng toàn bộ 10 sân',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:00 - 23:30',
    rating: 4.9,
    reviewCount: 310,
    amenities: ['Khán đài hàng ngàn chỗ ngồi', 'Phòng thay đồ VIP', 'Bình xịt y tế', 'Căng-tin đồ ăn nhẹ', 'Trọng tài VFF']
  },
  {
    id: 'vsa2',
    name: 'Sân Bóng Đá VSA2 Lê Đức Thọ',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    lat: 21.0315,
    lng: 105.7682,
    phone: '0968331155',
    managerName: 'Anh Hưng VSA',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ sợi đay cao cấp, giảm chấn va chạm tuyệt đối',
    parkingFee: 'Bãi đỗ ô tô 50 xe (30k), xe máy 5k có bảo vệ',
    floodlight: 'Đèn LED 1000W sáng phủ kín sân',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 140,
    amenities: ['Tắm nóng lạnh', 'Bình xịt lạnh y tế', 'Căng-tin đồ uống giải khát', 'Khán đài theo dõi']
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
    managerName: 'Anh Việt',
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

  // ================= QUẬN ĐỐNG ĐA =================
  {
    id: 'thuyloi',
    name: 'Sân Cỏ Nhân Tạo ĐH Thủy Lợi',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Số 175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội',
    lat: 21.0076,
    lng: 105.8239,
    phone: '0945998877',
    managerName: 'Thầy Hưng Ban QL',
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
    id: 'hoangcau',
    name: 'Sân Bóng Đá Hoàng Cầu',
    district: 'DongDa',
    districtLabel: 'Đống Đa',
    address: 'Khu Đô Thị Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội',
    lat: 21.0182,
    lng: 105.8254,
    phone: '0988443322',
    managerName: 'Anh Dũng Hoàng Cầu',
    totalSubPitches: 5,
    turfType: 'Cỏ nhân tạo sợi kim cương, độ nảy bóng chuẩn',
    parkingFee: 'Bãi ô tô đỗ ven hồ (30k), xe máy 5k có người trông',
    floodlight: 'Hệ thống đèn LED thể thao không góc chết',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 155,
    amenities: ['Gió hồ Hoàng Cầu thoáng mát', 'Tắm nóng lạnh', 'Căng tin đồ uống', 'Áo bib thi đấu']
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
    managerName: 'Thầy Phong',
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

  // ================= QUẬN HÀ ĐÔNG =================
  {
    id: 'cuongquoc',
    name: 'Cụm Sân Bóng Đá Cường Quốc (Hà Đông)',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Đường Phúc La - Văn Phú, Kiến Hưng, Hà Đông, Hà Nội',
    lat: 20.9578,
    lng: 105.7891,
    phone: '0966334455',
    managerName: 'Anh Long',
    totalSubPitches: 6,
    turfType: 'Sân đại bản doanh CLB Phủi Cường Quốc lừng danh bóng đá Hà Thành',
    parkingFee: 'Bãi đỗ ô tô cực rộng rãi 100 xe (Miễn phí)',
    floodlight: 'Đèn LED công suất lớn bao phủ toàn mặt sân',
    priceRange: '500.000đ - 750.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.8,
    reviewCount: 180,
    amenities: ['Căng tin đồ ăn nhẹ', 'Khu ghế ngồi khán giả VIP', 'Bình xịt lạnh y tế', 'Trọng tài phong trào', 'Tắm tráng']
  },
  {
    id: 'caudo-hadong',
    name: 'Sân Bóng Đá Cầu Đơ (Hà Đông)',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Đường Lê Hồng Phong, Hà Cầu, Hà Đông, Hà Nội',
    lat: 20.9682,
    lng: 105.7725,
    phone: '0983441188',
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
    id: 'vanquan',
    name: 'Sân Bóng Đá KĐT Văn Quán',
    district: 'HaDong',
    districtLabel: 'Hà Đông',
    address: 'Khu đô thị Văn Quán, Yên Phúc, Hà Đông, Hà Nội',
    lat: 20.9785,
    lng: 105.7865,
    phone: '0912667788',
    managerName: 'Anh Thắng',
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

  // ================= QUẬN HAI BÀ TRƯNG =================
  {
    id: 'bachkhoa',
    name: 'Sân Bóng Đá ĐH Bách Khoa Hà Nội',
    district: 'HaiBaTrung',
    districtLabel: 'Hai Bà Trưng',
    address: 'Khu liên hiệp thể thao Bách Khoa, Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
    lat: 21.0042,
    lng: 105.8451,
    phone: '0989224466',
    managerName: 'Thầy Hùng Thể Thao',
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

  // ================= QUẬN BẮC TỪ LIÊM =================
  {
    id: 'modiachat',
    name: 'Sân Bóng ĐH Mỏ - Địa Chất',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Số 18 Phố Viên, Đức Thắng, Bắc Từ Liêm, Hà Nội',
    lat: 21.0712,
    lng: 105.7768,
    phone: '0979445566',
    managerName: 'Anh Tuấn Anh',
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
  {
    id: 'conhue',
    name: 'Sân Bóng Đá Cổ Nhuế',
    district: 'BacTuLiem',
    districtLabel: 'Bắc Từ Liêm',
    address: 'Ngõ 145 Cổ Nhuế, Bắc Từ Liêm, Hà Nội',
    lat: 21.0625,
    lng: 105.7812,
    phone: '0984112266',
    managerName: 'Anh Đức Cổ Nhuế',
    totalSubPitches: 4,
    turfType: 'Cỏ nhân tạo phong trào lót cao su chống xước',
    parkingFee: 'Bãi ô tô 20 xe (20k), xe máy 5k',
    floodlight: 'Đèn LED 600W',
    priceRange: '500.000đ - 700.000đ / trận 90 phút',
    openingHours: '06:00 - 22:00',
    rating: 4.5,
    reviewCount: 55,
    amenities: ['Trà đá nước ngọt', 'Bình xịt giảm đau', 'Áo bib thi đấu']
  },

  // ================= QUẬN BA ĐÌNH & TÂY HỒ =================
  {
    id: 'phucxa',
    name: 'Cụm Sân Bóng Đá Phúc Xá (Ba Đình)',
    district: 'BaDinh',
    districtLabel: 'Ba Đình',
    address: 'Khu thể thao ven sông Hồng, Phúc Xá, Ba Đình, Hà Nội',
    lat: 21.0489,
    lng: 105.8492,
    phone: '0915332211',
    managerName: 'Anh Thắng',
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3.5 relative z-10 pt-1">
          <div className="flex items-center space-x-3">
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
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                Bản đồ Google Maps tương tác trực tiếp • Chỉ đường bằng giọng nói 1-chạm • Bãi đỗ ô tô &amp; Hotline đặt sân
              </p>
            </div>
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
            { id: 'ThanhXuan', label: 'Thanh Xuân' },
            { id: 'HoangMai', label: 'Hoàng Mai' },
            { id: 'CauGiay', label: 'Cầu Giấy' },
            { id: 'NamTuLiem', label: 'Nam Từ Liêm' },
            { id: 'DongDa', label: 'Đống Đa' },
            { id: 'HaDong', label: 'Hà Đông' },
            { id: 'HaiBaTrung', label: 'Hai Bà Trưng' },
            { id: 'BacTuLiem', label: 'Bắc Từ Liêm' },
            { id: 'BaDinh', label: 'Ba Đình' },
            { id: 'TayHo', label: 'Tây Hồ' }
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
