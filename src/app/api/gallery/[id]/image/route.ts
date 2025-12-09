import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = paramsSchema.parse(await params);

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
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }
    console.error("Error fetching gallery image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
