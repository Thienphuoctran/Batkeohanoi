import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="46" fill="#10b981"/>
    <circle cx="50" cy="50" r="40" fill="#090d16" stroke="#10b981" stroke-width="4"/>
    <text x="50" y="58" font-size="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" fill="#10b981" text-anchor="middle">7v7</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
