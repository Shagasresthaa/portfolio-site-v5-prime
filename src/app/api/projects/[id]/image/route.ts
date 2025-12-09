import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      select: { image: true, imageType: true },
    });

    if (!project?.image || !project?.imageType) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(project.image, {
      headers: {
        "Content-Type": project.imageType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching project image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
