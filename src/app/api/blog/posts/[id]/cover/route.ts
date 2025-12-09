import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
    console.error("Error fetching blog cover image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
