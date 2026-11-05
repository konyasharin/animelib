import { initTRPC, TRPCError } from '@trpc/server';

export interface User {
  id: string;
  name: string;
}

export interface Context {
  user: User | null;
}

export interface CreateContextOptions {
  authToken?: string | null;
}

/**
 * Контекст собирается из данных, которые транспорт-приложение вытащило из
 * запроса. Пакет ничего не знает ни про Node-адаптер, ни про Request/Response,
 * поэтому его можно поднять и на standalone-сервере, и в serverless-хендлере.
 */
export function createContext({ authToken }: CreateContextOptions): Context {
  const token = authToken?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { user: null };
  }

  return { user: { id: token, name: `user-${token.slice(0, 6)}` } };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Нужен заголовок Authorization',
    });
  }

  return next({ ctx: { user: ctx.user } });
});
