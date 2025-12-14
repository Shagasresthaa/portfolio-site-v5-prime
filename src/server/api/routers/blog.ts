import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { imageValidationSchema } from "@/lib/validators";

// Blog Post input schema
const blogPostInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().optional(), // base64
  imageType: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  tags: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

export const blogRouter = createTRPCRouter({
  // Blog Posts

  // Get all posts
  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
        imageType: true,
        _count: {
          select: { comments: true },
        },
      },
    });
  }),

  // Get published posts (public)
  getPublishedPosts: publicProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(12),
          search: z
            .string()
            .min(2, "Search must be at least 2 characters")
            .max(200, "Search must be less than 200 characters")
            .transform((val) => val.trim())
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const skip = (page - 1) * limit;
      // Search is already trimmed by Zod transform
      const search = input?.search;

      // Additional validation: reject if only special characters
      const isValidSearch =
        search && search.length >= 2 && /[a-zA-Z0-9]/.test(search);

      // Build where clause with search
      const whereClause = {
        published: true,
        ...(isValidSearch && {
          title: { contains: search, mode: "insensitive" as const },
        }),
      };

      const [posts, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where: whereClause,
          orderBy: { publishedAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            tags: true,
            imageType: true,
          },
        }),
        ctx.db.blogPost.count({ where: whereClause }),
      ]);

      return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get post by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.blogPost.findUnique({
        where: { slug: input.slug },
        include: {
          comments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Get post by ID (admin)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.blogPost.findUnique({
        where: { id: input.id },
      });
    }),

  getByIdWithComments: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.blogPost.findUnique({
        where: { id: input.id },
        include: {
          comments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Create post
  create: protectedProcedure
    .input(blogPostInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { coverImage, imageType, ...postData } = input;
      // Validate cover image if provided
      if (coverImage && imageType) {
        imageValidationSchema.parse({ image: coverImage, imageType });
      }
      return ctx.db.blogPost.create({
        data: {
          ...postData,
          coverImage: coverImage ? Buffer.from(coverImage, "base64") : null,
          imageType: imageType ?? null,
        },
      });
    }),

  // Update post
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: blogPostInputSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { coverImage, imageType, ...postData } = input.data;
      // Validate cover image if provided
      if (coverImage && imageType) {
        imageValidationSchema.parse({ image: coverImage, imageType });
      }
      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          ...postData,
          ...(coverImage && { coverImage: Buffer.from(coverImage, "base64") }),
          ...(imageType && { imageType }),
        },
      });
    }),

  // Delete post
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.delete({
        where: { id: input.id },
      });
    }),

  // Comments

  // Add comment (public)
  addComment: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        name: z.string().optional(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: input,
      });
    }),

  // Delete comment (admin)
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.delete({
        where: { id: input.id },
      });
    }),

  // Blog Images

  // Get all images
  getAllImages: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.blogImage.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageType: true,
        altText: true,
        createdAt: true,
      },
    });
  }),

  // Upload image
  uploadImage: protectedProcedure
    .input(
      z.object({
        image: z.string(), // base64
        imageType: z.string(),
        altText: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate image
      imageValidationSchema.parse({
        image: input.image,
        imageType: input.imageType,
      });
      return ctx.db.blogImage.create({
        data: {
          image: Buffer.from(input.image, "base64"),
          imageType: input.imageType,
          altText: input.altText,
        },
      });
    }),

  // Delete image
  deleteImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogImage.delete({
        where: { id: input.id },
      });
    }),
});
