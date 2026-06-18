import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function parseAllowedHosts(env: Record<string, string>): true | string[] {
  const fromEnv = (env.VITE_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  const apiUrl = env.VITE_API_URL?.trim();
  if (apiUrl) {
    try {
      const { hostname } = new URL(apiUrl);
      if (hostname) {
        return [hostname, 'localhost', '127.0.0.1'];
      }
    } catch {
      // ignore invalid URL
    }
  }

  // Dev/LAN: cho phép truy cập qua IP hoặc hostname bất kỳ
  return true;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL?.trim() || 'http://localhost:3001';
  const allowedHosts = parseAllowedHosts(env);

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

  const hostOptions = {
    host: true,
    port: 5173,
    allowedHosts,
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      ...hostOptions,
      proxy: proxyConfig,
    },
    preview: {
      ...hostOptions,
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
