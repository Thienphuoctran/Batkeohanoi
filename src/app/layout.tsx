import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/common/OfflineBanner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  themeColor: "#ede8dc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "GiaoHuu.vn — Sàn Bắt Đối Sân 7 & Chống Bùng Kèo Hà Nội",
  description:
    "Nền tảng ghép đối bóng đá sân 7 văn minh, cọc bảo chứng 200k, danh mục 65+ sân cỏ 12 quận Hà Nội kèm hotline chủ sân và trạm cứu hộ SOS.",
  applicationName: "GiaoHuu.vn",
  authors: [{ name: "Ban Quản Trị GiaoHuu.vn" }],
  generator: "Next.js",
  keywords: [
    "bắt đối sân 7",
    "tìm kèo bóng đá hà nội",
    "sân bóng hà nội",
    "bắt kèo phủi",
    "chống bùng kèo",
    "đặt sân bóng hà nội",
    "sân bóng cầu giấy",
    "sân bóng nam từ liêm",
    "sân bóng thanh xuân",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GiaoHuu.vn",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://giaohuu.vn",
    siteName: "GiaoHuu.vn",
    title: "GiaoHuu.vn — Sàn Bắt Đối Sân 7 & Chống Bùng Kèo Hà Nội",
    description:
      "Bảo chứng cọc 200k chống bùng, tra cứu hotline 65+ sân bóng 12 quận Hà Nội, ghép kèo hỏa tốc 5 phút.",
    images: [
      {
        url: "/images/vintage-scrapbook.jpg",
        width: 1200,
        height: 630,
        alt: "GiaoHuu.vn — Sàn Bắt Kèo Sân 7 Hà Nội",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiaoHuu.vn — Sàn Bắt Đối Sân 7 & Chống Bùng Kèo Hà Nội",
    description:
      "Nền tảng ghép đối bóng đá sân 7 văn minh, bảo chứng cọc 200k, chống bùng kèo tại Hà Nội",
    images: ["/images/vintage-scrapbook.jpg"],
  },
  icons: {
    icon: "/api/logo",
    apple: "/api/logo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="GiaoHuu.vn" />
      </head>
      <body className="min-h-screen bg-kraft-newspaper text-stone-900 antialiased font-sans">
        <OfflineBanner />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
