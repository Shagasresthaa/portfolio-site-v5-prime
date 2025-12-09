import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const contactMessageInputSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export const contactRouter = createTRPCRouter({
  // Submit contact form (public)
  submit: publicProcedure
    .input(contactMessageInputSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contactMessage.create({
        data: input,
      });
    }),

  // Get all messages (admin)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  // Mark as read (admin)
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contactMessage.update({
        where: { id: input.id },
        data: { read: true },
      });
    }),

  // Delete message (admin)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contactMessage.delete({
        where: { id: input.id },
      });
    }),
});
