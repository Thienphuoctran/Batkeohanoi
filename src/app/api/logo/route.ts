import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const sourcePath =
    "C:/Users/phuoc/.gemini/antigravity/brain/95ae5352-c680-4481-99a8-b2d84d8ab484/.user_uploaded/media_1792334189367_efba5db7.png";
  const publicDest = path.join(process.cwd(), "public", "logo-giaohuu.png");

  try {
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(publicDest)) {
        try {
          fs.copyFileSync(sourcePath, publicDest);
        } catch (copyErr) {
          console.error("Auto copy logo error:", copyErr);
        }
      }
      const buffer = fs.readFileSync(sourcePath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (fs.existsSync(publicDest)) {
      const buffer = fs.readFileSync(publicDest);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error("Failed to serve GiaoHuu logo:", err);
  }

  return new NextResponse("Logo Not Found", { status: 404 });
}
