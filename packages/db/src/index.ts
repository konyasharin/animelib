import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

import { databaseUrl } from './url';

// dev-серверы перезагружают модули — без синглтона на каждый reload
// открывался бы новый пул соединений
const globalForPrisma = globalThis as { prisma?: PrismaClient };

function getClient() {
  globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl() }),
  });

  return globalForPrisma.prisma;
}

// клиент создаётся при первом обращении, а не при импорте модуля
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property) as unknown;

    return typeof value === 'function' ? value.bind(client) : value;
  },
});
