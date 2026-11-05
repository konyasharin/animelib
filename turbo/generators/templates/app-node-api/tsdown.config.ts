import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  // внутренние пакеты отдают .ts-исходники, поэтому их нужно бандлить
  noExternal: [/^@repo\//],
});
