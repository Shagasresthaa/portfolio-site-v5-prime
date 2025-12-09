import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { MediaType } from "@prisma/client";
import { imageValidationSchema } from "@/lib/validators";

const MediaTypeEnum = z.enum([MediaType.IMAGE, MediaType.VIDEO]);

const galleryItemInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  caption: z.string().optional(),
  mediaType: MediaTypeEnum,
  image: z.string().optional(), // base64 for images
  imageType: z.string().optional(),
  videoUrl: z.string().url().optional(),
  tags: z.string(),
});

export const galleryRouter = createTRPCRouter({
  // Get all items (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(12),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        ctx.db.galleryItem.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            caption: true,
            mediaType: true,
            imageType: true,
            videoUrl: true,
            tags: true,
            createdAt: true,
          },
        }),
        ctx.db.galleryItem.count(),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get item by ID (admin)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.galleryItem.findUnique({
        where: { id: input.id },
      });
    }),

  // Create item (admin)
  create: protectedProcedure
    .input(galleryItemInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { image, imageType, ...itemData } = input;
      // Validate image if provided
      if (image && imageType) {
        imageValidationSchema.parse({ image, imageType });
      }
      return ctx.db.galleryItem.create({
        data: {
          ...itemData,
          image: image ? Buffer.from(image, "base64") : null,
          imageType: imageType ?? null,
        },
      });
    }),

  // Update item (admin)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: galleryItemInputSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { image, imageType, ...itemData } = input.data;
      // Validate image if provided
      if (image && imageType) {
        imageValidationSchema.parse({ image, imageType });
      }
      return ctx.db.galleryItem.update({
        where: { id: input.id },
        data: {
          ...itemData,
          ...(image && { image: Buffer.from(image, "base64") }),
          ...(imageType && { imageType }),
        },
      });
    }),

  // Delete item (admin)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.galleryItem.delete({
        where: { id: input.id },
      });
    }),
});
