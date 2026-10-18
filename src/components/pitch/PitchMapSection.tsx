// components/pitch/PitchMapSection.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Navigation, Phone, Car, Zap, 
  Beer, Sparkles, Share2, CheckCircle2, 
  Info, Compass, ExternalLink
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
  amenities: string[];
  afterMatchEateries: {
    name: string;
    distance: string;
    type: string;
    highlights: string; // Món ngon bình dân, không đối tác/chiết khấu
  }[];
}

const HANOI_PITCHES: PitchData[] = [
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
    turfType: 'Cỏ nhân tạo sợi đay cao cấp, giảm chấn',
    parkingFee: 'Bãi đỗ ô tô 30 xe (30k), xe máy miễn phí',
    floodlight: 'Dàn đèn LED 800W sáng chuẩn không chói mắt',
    amenities: ['Tắm nóng lạnh', 'Bình xịt lạnh y tế', 'Căng-tin trà đá', 'Cho thuê áo pitch'],
    afterMatchEateries: [
      { 
        name: 'Bia Hơi Hà Nội - 86 Trung Hòa', 
        distance: '350m', 
        type: 'Bia hơi & Đồ nhậu bình dân', 
        highlights: 'Bia hơi rót ca mát lạnh, nem chua rán, lạc luộc, không gian vỉa hè rộng rãi thoáng mát cho cả đội ngồi.' 
      },
      { 
        name: 'Lẩu Lòng Bò & Bắp Bò Duy Tân', 
        distance: '500m', 
        type: 'Lẩu bò nhúng dấm & Lẩu riêu', 
        highlights: 'Nước lẩu chua thanh giải rượu, bắp bò hoa tươi giòn, bàn dài phục vụ 14-20 anh em sau trận.' 
      }
    ]
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
    turfType: 'Cỏ nhân tạo kim cương tiêu chuẩn FIFA cơ sở',
    parkingFee: 'Bãi đỗ ô tô 50 xe (40k), xe máy 5k',
    floodlight: 'Hệ thống 16 cột đèn cao áp độc lập',
    amenities: ['Phòng thay đồ có khóa', 'Nước điện giải ướp lạnh', 'Bình xịt giảm đau'],
    afterMatchEateries: [
      { 
        name: 'Bia Hải Xồm - Hoàng Minh Giám', 
        distance: '250m', 
        type: 'Bia hơi truyền thống Hà Nội', 
        highlights: 'Quán bia huyền thoại gần sân, bia tươi rói, mực nướng than hoa, đậu lướt ván giòn tan.' 
      },
      { 
        name: 'Lẩu Gà Lá É Tao Ngộ', 
        distance: '400m', 
        type: 'Lẩu gà đặc sản', 
        highlights: 'Thịt gà ta chắc thịt, măng chua giòn, lá é thơm nồng, nước lẩu ngọt thanh hồi phục thể lực.' 
      }
    ]
  },
  {
    id: 'metri',
    name: 'Sân Bóng Đá Mễ Trì Hạ',
    district: 'NamTuLiem',
    districtLabel: 'Nam Từ Liêm',
    address: 'Đường Mễ Trì Hạ (cách The Garden 200m), Nam Từ Liêm',
    lat: 21.0152,
    lng: 105.7789,
    phone: '0977889911',
    managerName: 'Anh Cường',
    totalSubPitches: 6,
    turfType: 'Mặt cỏ nhân tạo mới thay năm 2025',
    parkingFee: 'Bãi gửi ô tô và xe máy rộng rãi miễn phí',
    floodlight: 'Đèn LED chống chói hướng gôn',
    amenities: ['Căng tin nước mía sạch', 'Wifi miễn phí', 'Tủ sạc pin điện thoại'],
    afterMatchEateries: [
      { 
        name: 'Bia Tươi Mễ Trì - Ngõ 14 Mễ Trì Hạ', 
        distance: '150m', 
        type: 'Bia hơi & Mồi nhậu bình dân', 
        highlights: 'Cách cổng sân 2 phút đi bộ, giá bia bình dân, chả mực nóng hổi và khoai tây chiên xào tỏi.' 
      },
      { 
        name: 'Lẩu Nướng Bình Dân The Manor', 
        distance: '300m', 
        type: 'Thịt nướng xèo xèo & Lẩu thái', 
        highlights: 'Set nướng lẩu đầy đặn, không gian lộng gió ngoài trời cực kỳ phù hợp tụ tập sau trận.' 
      }
    ]
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
    turfType: 'Cỏ nhân tạo 5cm lót hạt cao su đen đàn hồi',
    parkingFee: 'Xe máy 5k, ô tô đỗ ven hồ miễn phí',
    floodlight: 'Đèn cao áp 800W',
    amenities: ['Phục vụ trà đá quạt gió', 'Băng chun sơ cứu cổ chân'],
    afterMatchEateries: [
      { 
        name: 'Bia Hơi Lan Chín - Khương Đình', 
        distance: '400m', 
        type: 'Bia hơi chuẩn vị Hà Nội', 
        highlights: 'Bia hơi tươi đậm đà, bánh đa nướng, nem chua và cá chỉ vàng nướng bình dân.' 
      }
    ]
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
    turfType: 'Mặt cỏ cụm trường đại học chuẩn thi đấu sinh viên',
    parkingFee: 'Nhà để xe trường ĐH Thủy Lợi (an toàn 5k)',
    floodlight: 'Dàn đèn LED chuẩn sân thi đấu giải',
    amenities: ['Khán đài có mái che', 'Nhà vệ sinh sạch sẽ', 'Máy bán nước tự động'],
    afterMatchEateries: [
      { 
        name: 'Lẩu Ếch Măng Cay Tây Sơn', 
        distance: '200m', 
        type: 'Lẩu ếch phủi Hà Thành', 
        highlights: 'Ếch xào măng cay thơm phức, da ếch chiên giòn rụm, nồi lẩu giá sinh viên văn phòng.' 
      },
      { 
        name: 'Bia Hơi Cường Hói - Thái Hà', 
        distance: '500m', 
        type: 'Bia hơi & Mồi nhậu', 
        highlights: 'Bia tươi ngon ổn định, dạ dày xào dưa, sụn gà rang muối đậm đà nhâm nhi sau trận.' 
      }
    ]
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
    turfType: 'Sân đại bản doanh CLB Phủi Cường Quốc lừng danh',
    parkingFee: 'Bãi đỗ ô tô cực rộng rãi 100 xe (Miễn phí)',
    floodlight: 'Đèn LED công suất lớn bao phủ toàn mặt sân',
    amenities: ['Căng tin đồ ăn nhẹ', 'Khu ghế ngồi khán giả VIP', 'Bình xịt lạnh'],
    afterMatchEateries: [
      { 
        name: 'Bia Cỏ Kiến Hưng - Lẩu Riêu Cua', 
        distance: '300m', 
        type: 'Bia hơi & Lẩu riêu cua đồng', 
        highlights: 'Riêu cua nguyên chất béo ngậy, bắp bò tươi, giò tai sần sật, không gian vỉa hè lộng gió.' 
      }
    ]
  }
];

export const PitchMapSection: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPitchId, setSelectedPitchId] = useState<string>('trungkinh');
  const [activeTab, setActiveTab] = useState<'map' | 'eateries'>('map');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tính năng chủ kèo tích hợp vị trí Google Maps
  const [hostCustomGmapsLink, setHostCustomGmapsLink] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredPitches = useMemo(() => {
    if (selectedDistrict === 'all') return HANOI_PITCHES;
    return HANOI_PITCHES.filter(p => p.district === selectedDistrict);
  }, [selectedDistrict]);

  const activePitch = useMemo(() => {
    return HANOI_PITCHES.find(p => p.id === selectedPitchId) || HANOI_PITCHES[0];
  }, [selectedPitchId]);

  // Deep-link mở Google Maps dẫn đường chuẩn xác
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
      `📍 VỊ TRÍ SÂN BÓNG HÔM NAY (CHỦ KÈO GHIM):\n` +
      `• Sân: ${pitch.name}\n` +
      `• Địa chỉ: ${pitch.address}\n` +
      `• Bãi xe: ${pitch.parkingFee}\n` +
      `• Google Maps chỉ đường: ${gmapsUrl}\n` +
      `👉 Anh em đến sớm 15p khởi động nhé!`;

    navigator.clipboard.writeText(text);
    showToast('Đã sao chép vị trí Google Maps để dán vào nhóm Zalo đội!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-slate-100">
      
      {/* HEADER WIDGET: BẢN ĐỒ CỤM SÂN & TÍCH HỢP GOOGLE MAPS */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-pitch-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-pitch-600/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Bản Đồ Cụm Sân &amp; Tiện Ích Kèo Đệ Tam</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                  Hà Nội Realtime
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chủ kèo tích hợp vị trí Google Maps 1-chạm • Gợi ý quán bia hơi &amp; lẩu bình dân quanh sân
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${activeTab === 'map' ? 'bg-pitch-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Bản Đồ Sân</span>
            </button>
            <button
              onClick={() => setActiveTab('eateries')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${activeTab === 'eateries' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Beer className="w-3.5 h-3.5" />
              <span>Kèo Đệ Tam</span>
            </button>
          </div>
        </div>

        {/* DISTRICT FILTER CHIPS */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-3 pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1">
            <MapPin className="w-3 h-3 inline text-pitch-400 mr-0.5" /> Quận:
          </span>
          {[
            { id: 'all', label: 'Tất cả Hà Nội' },
            { id: 'CauGiay', label: 'Cầu Giấy' },
            { id: 'NamTuLiem', label: 'Nam Từ Liêm' },
            { id: 'ThanhXuan', label: 'Thanh Xuân' },
            { id: 'DongDa', label: 'Đống Đa' },
            { id: 'HaDong', label: 'Hà Đông' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all border ${selectedDistrict === d.id ? 'bg-slate-800 text-white border-pitch-500 shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: BẢN ĐỒ CỤM SÂN & TÍCH HỢP VỊ TRÍ GOOGLE MAPS CỦA CHỦ KÈO   */}
      {/* =================================================================== */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          
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
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none font-mono"
              />
              <button
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Cột trái: Danh sách các cụm sân */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredPitches.map(pitch => {
                const isSelected = pitch.id === selectedPitchId;
                return (
                  <div
                    key={pitch.id}
                    onClick={() => setSelectedPitchId(pitch.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-pitch-950/40 border-pitch-500 shadow-lg shadow-pitch-600/10' : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-xs font-bold ${isSelected ? 'text-pitch-300' : 'text-white'}`}>
                          {pitch.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center">
                          <MapPin className="w-3 h-3 text-pitch-400 mr-1 shrink-0" />
                          <span className="truncate">{pitch.address}</span>
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold shrink-0">
                        {pitch.totalSubPitches} sân 7
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                      <span className="text-emerald-400 font-medium">Bãi xe: {pitch.parkingFee.split('(')[0]}</span>
                      <span>•</span>
                      <span>{pitch.floodlight.split('sáng')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Khung bản đồ trực quan & Chi tiết cụm sân đang chọn */}
            <div className="md:col-span-2 space-y-3">
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex flex-col justify-between p-3">
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34,197,94,0.18) 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 32px 32px, 32px 32px'
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] bg-slate-900/90 text-white font-mono px-2.5 py-1 rounded-lg border border-slate-700/80 shadow flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>GPS: {activePitch.lat.toFixed(4)}, {activePitch.lng.toFixed(4)}</span>
                  </span>
                  <span className="text-[11px] bg-pitch-600 text-white font-bold px-2.5 py-1 rounded-lg shadow">
                    Khu vực {activePitch.districtLabel}
                  </span>
                </div>

                <div className="relative z-10 self-center flex flex-col items-center animate-bounce">
                  <div className="px-3 py-1 bg-slate-900/95 text-pitch-400 rounded-xl text-xs font-extrabold border border-pitch-500/50 shadow-xl flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-pitch-400" />
                    <span>{activePitch.name}</span>
                  </div>
                  <div className="w-4 h-4 bg-pitch-500 rounded-full border-2 border-white shadow-lg mt-1"></div>
                </div>

                <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white block truncate">{activePitch.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">{activePitch.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleShareZaloLocation(activePitch)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-pitch-400 rounded-lg border border-pitch-500/30 transition-all flex items-center space-x-1"
                      title="Gửi vị trí Zalo"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-bold text-[11px]">Copy Zalo</span>
                    </button>
                    <button
                      onClick={() => handleOpenGoogleMaps(activePitch)}
                      className="px-3 py-2 bg-pitch-600 hover:bg-pitch-500 active:scale-95 text-white rounded-lg font-bold text-[11px] shadow flex items-center space-x-1 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Mở Google Maps</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pitch Specs & Amenities Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200">Thông Số Kỹ Thuật &amp; Bãi Đỗ Xe Thực Tế</span>
                  <span className="text-slate-400 font-mono">Quản lý: {activePitch.managerName} ({activePitch.phone})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Mặt cỏ sân 7:</strong>
                      <span>{activePitch.turfType}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                    <Car className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Bãi đỗ ô tô &amp; xe máy:</strong>
                      <span>{activePitch.parkingFee}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Hệ thống chiếu sáng:</strong>
                      <span>{activePitch.floodlight}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-pitch-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Hotline đặt thêm sân:</strong>
                      <a href={`tel:${activePitch.phone}`} className="text-pitch-400 font-mono font-bold hover:underline">
                        {activePitch.phone} (Gọi trực tiếp)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activePitch.amenities.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-[10px]">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: TIỆN ÍCH "KÈO ĐỆ TAM" (QUÁN BIA HƠI & LẨU BÌNH DÂN GẦN SÂN)  */}
      {/* (KHÔNG QUA ĐỐI TÁC, KHÔNG CHIẾT KHẤU, 0 ĐỒNG KINH PHÍ CHO CHỦ WEB) */}
      {/* =================================================================== */}
      {activeTab === 'eateries' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Văn Hóa Phủi Hà Nội</span>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                  <Beer className="w-4 h-4 text-amber-400" />
                  <span>"Kèo Đệ Tam" - Quán Bia Hơi &amp; Lẩu Bình Dân Gần Sân {activePitch.name}</span>
                </h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold border border-slate-700">
                Bán kính &lt; 500m
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2 text-xs text-slate-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Danh mục quán ẩm thực bình dân quanh sân bóng do cộng đồng chia sẻ. Hoàn toàn <strong>0 đồng kinh phí đối tác</strong>, không chiết khấu thương mại — gợi ý vị trí thực tế để anh em đội bóng ngồi giải khát giao lưu sau trận!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {activePitch.afterMatchEateries.map((eat, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-white text-xs block">{eat.name}</strong>
                      <span className="text-[11px] text-amber-400 font-medium">{eat.type}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold border border-slate-700">
                      Cách {eat.distance}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    🍻 {eat.highlights}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-pitch-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PitchMapSection;
