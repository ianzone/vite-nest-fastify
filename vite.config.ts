import { resolve } from 'path';
import { VitePluginNode } from 'vite-plugin-node';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'nest',
      appPath: './src/main.ts',
      tsCompiler: 'swc',
      swcOptions: {
        sourceMaps: true,
        minify: true,
      },
    }),
  ],
  optimizeDeps: {
    // Vite does not work well with optional dependencies,
    // mark them as ignored for now
    exclude: [
      '@nestjs/microservices',
      '@nestjs/websockets',
      // 'cache-manager',
      'class-transformer/storage',
      // 'class-validator',
    ],
  },
});
