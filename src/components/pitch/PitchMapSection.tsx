// components/pitch/PitchMapSection.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Navigation, Phone, Car, Zap, 
  Sparkles, Share2, CheckCircle2, 
  Compass, Search, Clock,
  ShieldCheck, Layers, Eye, PlusCircle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    openingHours: '06:00 - 23:00 (Mở cửa tất cả các ngày)',
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
    rating: 4.5,
    reviewCount: 74,
    amenities: ['Phục vụ trà đá quạt gió', 'Băng chun sơ cứu cổ chân', 'Áo tập 2 màu', 'Khu ngồi nghỉ ven hồ']
  },
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
    turfType: 'Mặt sân quân đội chuẩn quốc gia, mặt bằng bằng phẳng tuyệt đối',
    parkingFee: 'Khu đỗ xe quân sự an ninh tuyệt đối, ô tô 30k, xe máy 5k',
    floodlight: 'Hệ thống đèn LED thể thao cao cấp không sấp bóng',
    priceRange: '650.000đ - 900.000đ / trận 90 phút',
    openingHours: '05:30 - 23:00',
    rating: 4.9,
    reviewCount: 195,
    amenities: ['Khu an ninh bảo vệ nghiêm ngặt', 'Tắm nóng lạnh', 'Căng tin đồ uống phong phú', 'Áo bib chuẩn', 'Băng ghế dự bị có mái che']
  },
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
  }
];

export const PitchMapSection: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPitchId, setSelectedPitchId] = useState<string>('trungkinh');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'radar' | 'google-embed'>('radar');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tính năng chủ kèo tích hợp vị trí Google Maps
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

  // Deep-link mở Google Maps dẫn đường chuẩn xác bằng giọng nói
  const handleOpenGoogleMaps = (pitch: PitchData) => {
    const url = hostCustomGmapsLink.trim() !== '' 
      ? hostCustomGmapsLink 
      : `https://www.google.com/maps/dir/?api=1&destination=${pitch.lat},${pitch.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Sao chép vị trí và cú pháp tin nhắn Zalo gửi cả đội
  const handleShareZaloLocation = (pitch: PitchData) => {
    const gmapsUrl = hostCustomGmapsLink.trim() !== '' 
      ? hostCustomGmapsLink 
      : `https://www.google.com/maps/dir/?api=1&destination=${pitch.lat},${pitch.lng}`;

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
    <div className="w-full max-w-4xl mx-auto space-y-4 text-slate-100">
      
      {/* HEADER WIDGET: BẢN ĐỒ CỤM SÂN BÓNG ĐÁ HÀ NỘI */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <MapPin className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Bản Đồ Cụm Sân Bóng Phủi Hà Nội</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {HANOI_PITCHES.length} Cụm Sân Tuyển Chọn
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Định vị cụm sân 7/5 Hà Nội • Tích hợp Google Maps chỉ đường 1-chạm • Bãi đỗ ô tô &amp; Hotline trực tiếp
              </p>
            </div>
          </div>

          {/* Toggle Chế Độ Xem Bản Đồ */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-white/[0.1] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                viewMode === 'radar' 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Radar Tọa Độ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('google-embed')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                viewMode === 'google-embed' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Google Maps Live</span>
            </button>
          </div>
        </div>

        {/* THANH TÌM KIẾM NHANH SÂN BÓNG */}
        <div className="pt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sân (Thành Phát, Mễ Trì, Đình Thôn...), đường phố..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950/90 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* DISTRICT FILTER CHIPS */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1 flex items-center">
            <MapPin className="w-3 h-3 text-emerald-400 mr-0.5" /> Khu vực:
          </span>
          {[
            { id: 'all', label: 'Tất cả Hà Nội' },
            { id: 'CauGiay', label: 'Cầu Giấy' },
            { id: 'NamTuLiem', label: 'Nam Từ Liêm' },
            { id: 'ThanhXuan', label: 'Thanh Xuân' },
            { id: 'DongDa', label: 'Đống Đa' },
            { id: 'HaDong', label: 'Hà Đông' },
            { id: 'BacTuLiem', label: 'Bắc Từ Liêm' },
            { id: 'BaDinh', label: 'Ba Đình' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all border ${
                selectedDistrict === d.id 
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 ring-1 ring-emerald-400 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-white/[0.08] hover:text-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* TÍNH NĂNG CHỦ KÈO TÍCH HỢP VỊ TRÍ GOOGLE MAPS */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-sky-600/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white">Chủ Kèo Được Tích Hợp Vị Trí Lên Google Maps</span>
          </div>
          <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-500/30">
            Chỉ Đường 1-Chạm
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Đội chủ nhà khi tạo kèo có thể dán link ghim Google Maps hoặc hệ thống sẽ tự động tạo link dẫn đường chuẩn xác từ Tên sân + Địa chỉ bạn điền. Đối thủ bấm vào là mở Google Maps dẫn đường ngay.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={hostCustomGmapsLink}
            onChange={(e) => setHostCustomGmapsLink(e.target.value)}
            placeholder="Dán link Google Maps hoặc để trống để định vị theo cụm sân đang chọn"
            className="flex-1 bg-slate-950 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => {
              if (hostCustomGmapsLink.trim() !== '') {
                window.open(hostCustomGmapsLink, '_blank');
              } else {
                handleOpenGoogleMaps(activePitch);
              }
            }}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center space-x-1.5 transition-all shadow"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Test Link Google Maps</span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH CỤM SÂN & BẢN ĐỒ CHI TIẾT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cột trái: Danh sách các cụm sân */}
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
            <span>Tìm thấy {filteredPitches.length} cụm sân</span>
            <span>Bấm để xem chi tiết</span>
          </div>
          {filteredPitches.map(pitch => {
            const isSelected = pitch.id === activePitch.id;
            return (
              <div
                key={pitch.id}
                onClick={() => setSelectedPitchId(pitch.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40' 
                    : 'bg-slate-950/80 border-white/[0.08] hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {pitch.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center">
                      <MapPin className="w-3 h-3 text-emerald-400 mr-1 shrink-0" />
                      <span className="truncate">{pitch.address}</span>
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-semibold shrink-0 border border-white/5">
                    {pitch.totalSubPitches} sân 7
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-emerald-400 font-medium truncate max-w-[170px]">
                    {pitch.parkingFee.split('(')[0]}
                  </span>
                  <span className="text-amber-400 font-bold shrink-0">
                    ★ {pitch.rating}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredPitches.length === 0 && (
            <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-center text-xs text-slate-400">
              Không tìm thấy cụm sân phù hợp với bộ lọc. Hãy thử chọn quận khác hoặc xóa từ khóa tìm kiếm.
            </div>
          )}
        </div>

        {/* Cột phải: Khung bản đồ trực quan & Chi tiết cụm sân đang chọn */}
        <div className="md:col-span-2 space-y-3">
          
          {/* 1. MÀN HÌNH BẢN ĐỒ (CHUYỂN ĐỔI RADAR HOẶC GOOGLE MAPS EMBED) */}
          <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/[0.1] bg-slate-950 shadow-inner flex flex-col justify-between">
            {viewMode === 'radar' ? (
              <>
                {/* Visual Stadium Pattern Background */}
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34,197,94,0.22) 0%, transparent 65%), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 32px 32px, 32px 32px'
                  }}
                />

                {/* Radar Sweep Animation Effect */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
                  <div className="w-36 h-36 rounded-full border border-emerald-500/30" />
                </div>

                <div className="relative z-10 flex items-center justify-between p-3">
                  <span className="text-[11px] bg-slate-900/90 text-white font-mono px-2.5 py-1 rounded-lg border border-slate-700/80 shadow flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>GPS: {activePitch.lat.toFixed(4)}, {activePitch.lng.toFixed(4)}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Đang Mở Cửa
                    </span>
                    <span className="text-[11px] bg-emerald-600 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow">
                      {activePitch.districtLabel}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 self-center flex flex-col items-center">
                  <div className="px-3.5 py-1.5 bg-slate-950/95 text-emerald-300 rounded-xl text-xs font-extrabold border border-emerald-500/50 shadow-2xl flex items-center space-x-1.5 backdrop-blur-md">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{activePitch.name}</span>
                  </div>
                  <div className="w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg mt-1 animate-pulse"></div>
                </div>

                <div className="relative z-10 bg-slate-900/95 backdrop-blur-md p-3 rounded-b-2xl border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-extrabold text-white block truncate">{activePitch.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">{activePitch.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleShareZaloLocation(activePitch)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-emerald-500/30 transition-all flex items-center space-x-1"
                      title="Gửi vị trí Zalo"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-bold text-[11px]">Copy Zalo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleMaps(activePitch)}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-lg font-black text-[11px] shadow flex items-center space-x-1 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mở Google Maps</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* CHẾ ĐỘ XEM GOOGLE MAPS EMBED LIVE TRỰC TIẾP */
              <div className="w-full h-full relative">
                <iframe
                  title={`Google Maps ${activePitch.name}`}
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    📍 {activePitch.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenGoogleMaps(activePitch)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow"
                  >
                    <Navigation className="w-3 h-3 stroke-[3]" />
                    <span>Dẫn Đường</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. THÔNG SỐ KỸ THUẬT & DỊCH VỤ THỰC TẾ CỦA CỤM SÂN */}
          <div className="bg-slate-900/80 border border-white/[0.08] rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-2.5 gap-1.5">
              <div>
                <span className="font-extrabold text-white text-sm">Thông Số Kỹ Thuật &amp; Bãi Đỗ Xe Thực Tế</span>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">★ {activePitch.rating}/5.0 ({activePitch.reviewCount} đánh giá)</span>
                  <span>•</span>
                  <span>{activePitch.openingHours}</span>
                </div>
              </div>
              <span className="text-slate-300 font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                Quản lý: <strong className="text-emerald-300">{activePitch.managerName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/[0.06] flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Mặt cỏ sân 7:</strong>
                  <span>{activePitch.turfType}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/[0.06] flex items-start space-x-2">
                <Car className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Bãi đỗ ô tô &amp; xe máy:</strong>
                  <span>{activePitch.parkingFee}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/[0.06] flex items-start space-x-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Hệ thống chiếu sáng:</strong>
                  <span>{activePitch.floodlight}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/[0.06] flex items-start space-x-2">
                <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Giá thuê tham khảo:</strong>
                  <span className="text-rose-300 font-bold">{activePitch.priceRange}</span>
                </div>
              </div>
            </div>

            {/* Hotline gọi trực tiếp */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Hotline quản lý đặt sân:</div>
                  <div className="text-[10px] text-slate-400">Gọi xác nhận trống sân ca 17:30, 19:00, 20:30</div>
                </div>
              </div>
              <a
                href={`tel:${activePitch.phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow transition"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>{activePitch.phone}</span>
              </a>
            </div>

            {/* Danh sách tiện ích có sẵn tại sân */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Tiện ích thực tế có sẵn tại cụm sân:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePitch.amenities.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-slate-950 border border-white/[0.08] text-slate-300 rounded-lg text-[10px] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
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
