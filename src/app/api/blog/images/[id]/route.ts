import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const image = await db.blogImage.findUnique({
      where: { id },
      select: { image: true, imageType: true },
    });

    if (!image?.image || !image?.imageType) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(image.image, {
      headers: {
        "Content-Type": image.imageType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching blog image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
