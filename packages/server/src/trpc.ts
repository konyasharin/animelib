import { initTRPC } from '@trpc/server';

export interface Context {
  authToken: string | null;
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
  return { authToken: authToken ?? null };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
