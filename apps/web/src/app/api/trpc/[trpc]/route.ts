import { appRouter, createContext } from '@repo/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () =>
      createContext({ authToken: request.headers.get('authorization') }),
  });
}

export { handler as GET, handler as POST };
