import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  StatusFlags,
  CollabModes,
  AffiliationTypes,
  SourceCodeAvailibility,
} from "@prisma/client";
import { imageValidationSchema } from "@/lib/validators";

// Convert Prisma enums to Zod enums
const StatusFlagsEnum = z.enum([
  StatusFlags.PLANNING,
  StatusFlags.IN_PROGRESS,
  StatusFlags.COMPLETED,
  StatusFlags.MAINTAINED,
  StatusFlags.ARCHIVED,
]);

const CollabModesEnum = z.enum([CollabModes.SOLO, CollabModes.GROUP]);

const AffiliationTypesEnum = z.enum([
  AffiliationTypes.INDEPENDENT,
  AffiliationTypes.UNIVERSITY,
  AffiliationTypes.ORGANIZATION,
  AffiliationTypes.CLUB,
]);

const SourceCodeAvailibilityEnum = z.enum([
  SourceCodeAvailibility.OPEN_SOURCE,
  SourceCodeAvailibility.CLOSED_SOURCE,
  SourceCodeAvailibility.UNDER_NDA,
]);

const projectInputSchema = z.object({
  name: z.string().trim().min(1),
  shortDesc: z.string().trim().min(1),
  longDesc: z.string().trim().optional(),
  statusFlag: StatusFlagsEnum,
  startDate: z.date(),
  endDate: z.date().nullable(),
  collabMode: CollabModesEnum,
  affiliation: z.string().trim().min(1),
  affiliationType: AffiliationTypesEnum,
  sourceCodeAvailibility: SourceCodeAvailibilityEnum,
  techStacks: z.string().trim().min(1),
  projectUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  image: z.string().optional(), // base64 string
  imageType: z.string().optional(),
});

// Create a new project
export const projectsRouter = createTRPCRouter({
  addProject: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { image, imageType, ...projectData } = input;

      // Validate image if provided
      if (image && imageType) {
        imageValidationSchema.parse({ image, imageType });
      }

      const project = await ctx.db.project.create({
        data: {
          ...projectData,
          image: image ? Buffer.from(image, "base64") : null,
          imageType: imageType ?? null,
        },
      });
      return project;
    }),

  // Get all unique tech stacks (public)
  getAllTechStacks: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      select: { techStacks: true },
    });

    const techStackSet = new Set<string>();
    projects.forEach((project) => {
      if (project.techStacks) {
        project.techStacks
          .split(",")
          .forEach((stack) => techStackSet.add(stack.trim()));
      }
    });

    return Array.from(techStackSet).sort();
  }),

  // Get all projects (public - for the projects page)
  // Exclude binary image data to keep response size small
  fetchAllProjects: publicProcedure
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
          techStacks: z.array(z.string()).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const skip = (page - 1) * limit;
      const selectedTechStacks = input?.techStacks;
      // Search is already trimmed by Zod transform
      const search = input?.search;

      // Additional validation: reject if only special characters
      const isValidSearch =
        search && search.length >= 2 && /[a-zA-Z0-9]/.test(search);

      // Build tech stack filter condition
      const techStackConditions = selectedTechStacks?.length
        ? {
            AND: selectedTechStacks.map((stack) => ({
              techStacks: { contains: stack, mode: "insensitive" as const },
            })),
          }
        : undefined;

      // Build where clause with search and tech stacks
      const whereClause = {
        ...(isValidSearch && {
          name: { contains: search, mode: "insensitive" as const },
        }),
        ...techStackConditions,
      };

      const [projects, total] = await Promise.all([
        ctx.db.project.findMany({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          orderBy: { startDate: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            shortDesc: true,
            longDesc: true,
            statusFlag: true,
            startDate: true,
            endDate: true,
            collabMode: true,
            affiliation: true,
            affiliationType: true,
            sourceCodeAvailibility: true,
            techStacks: true,
            projectUrl: true,
            liveUrl: true,
            imageType: true, // Include type but not the binary data
            // image: false - explicitly excluded
          },
        }),
        ctx.db.project.count({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        }),
      ]);

      return {
        projects,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get single project by ID (includes image for editing)
  fetchProjectById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
      });
      return project;
    }),

  // Update existing project
  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: projectInputSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { image, imageType, ...projectData } = input.data;
      // Validate image if provided
      if (image && imageType) {
        imageValidationSchema.parse({ image, imageType });
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...projectData,
          ...(image && { image: Buffer.from(image, "base64") }),
          ...(imageType && { imageType }),
        },
      });
      return updatedProject;
    }),

  // Delete project
  deleteProject: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const deletedProject = await ctx.db.project.delete({
        where: { id: input.id },
      });
      return deletedProject;
    }),
});
