import type { Metadata, Viewport } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  themeColor: "#ede8dc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "GiaoHuu.vn — Sân Ghép Trận Sân 7 & Chống Bùng Kèo Hà Nội",
  description:
    "Nền tảng ghép đối bóng đá sân 7 văn minh, bảo chứng cọc 200k, chống bùng kèo tại Hà Nội",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GiaoHuu.vn",
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
      <body className="min-h-screen bg-kraft-newspaper text-stone-900 antialiased font-sans">
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
