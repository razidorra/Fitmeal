import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // GitHub Pages serves this project from /Fitmeal/, not the domain root, so every built asset
    // URL needs that prefix. Leave the dev server at "/" — GITHUB_PAGES is only set in CI.
    base: process.env.GITHUB_PAGES ? '/Fitmeal/' : '/',
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  };
});
