import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates image magic bytes to ensure it's a real image
 */
export function validateImageMagicBytes(base64: string): boolean {
  try {
    const buffer = Buffer.from(base64, "base64");

    // Check magic bytes for common image formats
    const isPNG =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isJPEG =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWEBP =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    const isGIF =
      buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

    return isPNG || isJPEG || isWEBP || isGIF;
  } catch {
    return false;
  }
}

/**
 * Zod schema for image validation
 */
export const imageValidationSchema = z.object({
  image: z.string().refine((base64) => {
    const buffer = Buffer.from(base64, "base64");

    // Check size
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Image size exceeds 5MB limit",
      });
    }

    // Check magic bytes
    if (!validateImageMagicBytes(base64)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Invalid image format. Only PNG, JPEG, WEBP, and GIF are allowed",
      });
    }

    return true;
  }, "Invalid image"),
  imageType: z.enum([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
  ]),
});
