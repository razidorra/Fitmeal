import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function normalizeBasePath(configuredPath: string | undefined) {
  const path = configuredPath?.trim().replace(/^\/+|\/+$/g, '');
  return path ? `/${path}/` : '/';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // Subpath hosts such as GitHub Pages provide this at build time. Root deployments and local
    // development need no configuration, while forks can deploy under their own repository name.
    base: normalizeBasePath(env.VITE_BASE_PATH),
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
