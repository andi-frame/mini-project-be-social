import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { pantunPosts } from "~/server/db/schema";
import { eq, and, or, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Define your router
export const pantunRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(pantunPosts);
  }),
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const result = await db
      .select()
      .from(pantunPosts)
      .where(eq(pantunPosts.id, input));

    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Pantun with ID ${input} not found`,
      });
    }

    return result;
  }),
  getSampiranByEnding: publicProcedure
    .input(
      z.object({
        jumlahSampiran: z.enum(["1", "2"]),
        ending: z.string(),
      }),
    )
    .query(async ({ input }) => {
      if (input.jumlahSampiran === "1") {
        const result = await db
          .select()
          .from(pantunPosts)
          .where(
            or(
              like(pantunPosts.sampiran_1, `%${input.ending}`),
              like(pantunPosts.sampiran_2, `%${input.ending}`),
            ),
          );

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Pantun with ending ${input.ending} not found`,
          });
        }

        return result;
      } else if (input.jumlahSampiran === "2") {
        const result = await db
          .select()
          .from(pantunPosts)
          .where(
            and(
              like(pantunPosts.sampiran_1, `%${input.ending}`),
              like(pantunPosts.sampiran_2, `%${input.ending}`),
            ),
          );

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Pantun with ending ${input.ending} not found`,
          });
        }

        return result;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `jumlahSampiran isn't 1 or 2`,
        });
      }
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
      const result = await db
        .update(pantunPosts)
        .set({
          sampiran_1: input.sampiran_1,
          sampiran_2: input.sampiran_2,
          content_1: input.content_1,
          content_2: input.content_2,
          updatedAt: new Date(),
        })
        .where(eq(pantunPosts.id, input.id));

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Pantun with ID ${input} not found`,
        });
      }

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
