import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const item = await db.galleryItem.findUnique({
      where: { id },
      select: { image: true, imageType: true },
    });

    if (!item?.image || !item?.imageType) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(item.image, {
      headers: {
        "Content-Type": item.imageType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
