import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const sourcePath =
    "C:\\Users\\phuoc\\.gemini\\antigravity\\brain\\44f7361c-6a99-4c1f-bcd3-4c918f4055c2\\.user_uploaded\\media_1792397232695_2e72c5fe.jpg";
  const publicDest = path.join(
    process.cwd(),
    "public",
    "images",
    "vintage-scrapbook.jpg"
  );

  try {
    if (fs.existsSync(sourcePath)) {
      const buffer = fs.readFileSync(sourcePath);
      // Automatically copy to public/images/vintage-scrapbook.jpg if not exists
      try {
        const dir = path.dirname(publicDest);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(publicDest)) {
          fs.writeFileSync(publicDest, buffer);
        }
      } catch (copyErr) {
        console.error("[API vintage-image] Could not copy to public:", copyErr);
      }

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Fallback if publicDest already exists
    if (fs.existsSync(publicDest)) {
      const buffer = fs.readFileSync(publicDest);
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
