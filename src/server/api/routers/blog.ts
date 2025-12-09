import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
  getPublishedPosts: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        tags: true,
        imageType: true,
      },
    });
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
