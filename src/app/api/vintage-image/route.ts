import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const publicDest = path.join(
    process.cwd(),
    "public",
    "images",
    "vintage-scrapbook.jpg"
  );

  try {
    // 1. Ưu tiên đọc trực tiếp từ thư mục public/images/ chuẩn production
    if (fs.existsSync(publicDest)) {
      const buffer = fs.readFileSync(publicDest);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Dự phòng trong trường hợp đường dẫn tĩnh khác
    const altFallback = path.join(
      process.cwd(),
      "public",
      "vintage-scrapbook.jpg"
    );
    if (fs.existsSync(altFallback)) {
      const buffer = fs.readFileSync(altFallback);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error("[API vintage-image Error]", err);
  }

  return new NextResponse("Image not found", { status: 404 });
}
