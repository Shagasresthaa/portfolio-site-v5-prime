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

    const post = await db.blogPost.findUnique({
      where: { id },
      select: { coverImage: true, imageType: true },
    });

    if (!post?.coverImage || !post?.imageType) {
      return new NextResponse("Cover image not found", { status: 404 });
    }

    return new NextResponse(post.coverImage, {
      headers: {
        "Content-Type": post.imageType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }
    console.error("Error fetching blog cover image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
