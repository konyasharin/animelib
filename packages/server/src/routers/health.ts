import { publicProcedure, router } from '../trpc';

export const healthRouter = router({
  check: publicProcedure.query(() => ({
    status: 'ok' as const,
    uptime: Math.round(process.uptime()),
    checkedAt: new Date().toISOString(),
  })),
});
