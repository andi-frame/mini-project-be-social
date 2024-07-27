import { z } from "zod";
import { db } from "~/server/db";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { pantunPosts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Define your router
export const pantunRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(pantunPosts);
  }),
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await db.select().from(pantunPosts).where(eq(pantunPosts.id, input));
  }),
  create: publicProcedure
    .input(
      z.object({
        sampiran_1: z.string(),
        sampiran_2: z.string().optional(),
        content_1: z.string(),
        content_2: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [newPost] = await db.insert(pantunPosts).values(input).returning();
      return newPost;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        sampiran_1: z.string(),
        sampiran_2: z.string().optional(),
        content_1: z.string(),
        content_2: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(pantunPosts)
        .set({
          sampiran_1: input.sampiran_1,
          sampiran_2: input.sampiran_2,
          content_1: input.content_1,
          content_2: input.content_2,
          updatedAt: new Date(),
        })
        .where(eq(pantunPosts.id, input.id));
      return await db
        .select()
        .from(pantunPosts)
        .where(eq(pantunPosts.id, input.id));
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    const pantunExist = await db
      .select()
      .from(pantunPosts)
      .where(eq(pantunPosts.id, input));

    if (pantunExist.length === 0) {
      return { success: false, text: `Pantun with id ${input} does not exist` };
    }

    await db.delete(pantunPosts).where(eq(pantunPosts.id, input));
    return { success: true, text: `Pantun with id ${input} has been deleted` };
  }),
});
