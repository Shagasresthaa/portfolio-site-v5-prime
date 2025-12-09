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
  endDate: z.date(),
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

  // Get all projects (public - for the projects page)
  // Exclude binary image data to keep response size small
  fetchAllProjects: publicProcedure.query(async ({ ctx }) => {
    const retrievedProjects = await ctx.db.project.findMany({
      orderBy: { startDate: "desc" },
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
    });
    return retrievedProjects;
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
