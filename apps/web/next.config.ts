import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Next читает .env только из своей папки — подтягиваем общий из корня
config({ path: new URL('../../.env', import.meta.url) });

const nextConfig: NextConfig = {
  // внутренние пакеты отдают .ts-исходники, Next должен их скомпилировать
  transpilePackages: ['@repo/components', '@repo/server', '@repo/db'],
};

export default nextConfig;
