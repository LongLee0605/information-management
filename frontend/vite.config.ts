import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL?.trim() || 'http://localhost:3001';

  if (mode === 'production' && !env.VITE_API_URL?.trim()) {
    throw new Error(
      'Thiếu VITE_API_URL trong frontend/.env.production. Copy .env.production.example và chỉnh URL API.',
    );
  }

  const proxyConfig = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: proxyConfig,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
          },
        },
      },
    },
  };
});
