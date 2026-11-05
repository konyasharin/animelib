import { prisma } from '@repo/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';

async function findTodo(id: string) {
  const todo = await prisma.todo.findUnique({ where: { id } });

  if (!todo) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `Нет задачи ${id}` });
  }

  return todo;
}

export const todosRouter = router({
  list: publicProcedure.query(() =>
    prisma.todo.findMany({ orderBy: { createdAt: 'asc' } }),
  ),

  add: publicProcedure
    .input(z.object({ title: z.string().min(1).max(120) }))
    .mutation(({ input }) =>
      prisma.todo.create({ data: { title: input.title } }),
    ),

  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const todo = await findTodo(input.id);

      return prisma.todo.update({
        where: { id: todo.id },
        data: { done: !todo.done },
      });
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await findTodo(input.id);
      await prisma.todo.delete({ where: { id: input.id } });

      return { id: input.id };
    }),

  // procedure с middleware: без заголовка Authorization вернётся UNAUTHORIZED
  clearCompleted: protectedProcedure.mutation(async ({ ctx }) => {
    const { count } = await prisma.todo.deleteMany({ where: { done: true } });

    return { removed: count, by: ctx.user.name };
  }),
});
