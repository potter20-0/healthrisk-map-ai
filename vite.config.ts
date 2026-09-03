import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Vercel (and any root-domain host) serves from "/"; GitHub Pages serves from
  // a project subpath. Vercel sets VERCEL=1 during its builds, so the same
  // `npm run build` produces correct asset URLs on both. Dev always stays at "/".
  // Set BASE_PATH explicitly to override for any other host.
  const base =
    process.env.BASE_PATH ??
    (mode !== 'production' || process.env.VERCEL ? '/' : '/healthrisk-map-ai/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
