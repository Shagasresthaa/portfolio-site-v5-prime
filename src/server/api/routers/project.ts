import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  StatusFlags,
  CollabModes,
  AffiliationTypes,
  SourceCodeAvailibility,
} from "@prisma/client";

export const projectsRouter = createTRPCRouter({
  // Create a new project
  addProject: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
        shortDesc: z.string().trim().min(1),
        longDesc: z.string().trim().optional(),
        statusFlag: z.nativeEnum(StatusFlags),
        startDate: z.date(),
        endDate: z.date(),
        collabMode: z.nativeEnum(CollabModes),
        affiliation: z.string().trim().min(1),
        affiliationType: z.nativeEnum(AffiliationTypes),
        sourceCodeAvailibility: z.nativeEnum(SourceCodeAvailibility),
        techStacks: z.string().trim().min(1),
        projectUrl: z.string().url().optional(),
        liveUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          shortDesc: input.shortDesc,
          longDesc: input.longDesc,
          statusFlag: input.statusFlag,
          startDate: input.startDate,
          endDate: input.endDate,
          collabMode: input.collabMode,
          affiliation: input.affiliation,
          affiliationType: input.affiliationType,
          sourceCodeAvailibility: input.sourceCodeAvailibility,
          techStacks: input.techStacks,
          projectUrl: input.projectUrl,
          liveUrl: input.liveUrl,
        },
      });
      return project;
    }),

  // Get all projects
  fetchAllProjects: publicProcedure.query(async ({ ctx }) => {
    const retrievedProjects = (await ctx.db.project.findMany()) ?? null;
    return retrievedProjects;
  }),
});
