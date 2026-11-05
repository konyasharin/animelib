/**
 * Читается лениво: `next build` импортирует роутеры, и без этого сборка
 * требовала бы боевой DATABASE_URL.
 */
export function databaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL не задан. Скопируйте .env.example в .env в корне репозитория.',
    );
  }

  return url;
}
