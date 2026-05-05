import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'FastLabel',
          short_name: 'FastLabel',
          description: 'Offline Shipping Label Maker',
          theme_color: '#10b981',
          icons: [
            {
              src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTE2LjA4OCA5LjEyNC0uODE2IDIuMTA2Yy0uMTA5LjI4LS4xNjYuNDItLjI1OC41MjVhMSAxIDAgMCAxLS42LjI4M2MtLjEzLjAyMy0uMzAxIC4wMjMtLjY0My4wMjNIMTBoLTEuMjU4Yy0uMzQxIDAtLjUwOSAwLS42NC0uMDIzYTEgMSAwIDAgMS0uNi0uMjgyYy0uMDkxLS4xMDQtLjE1LS4yNDUtLjI1OC0uNTI1bC0uODItMi4xMTRhMSAxIDAgMCAwLS45MjItLjU2OWgtMS4zMWEyLjg3IDIuODcgMCAwIDAtMi44NyAyLjg3djguMjZhMi44NyAyLjg3IDAgMCAwIDIuODcgMi44N0gyMGEyLjg3IDIuODcgMCAwIDAgMi44Ny0yLjg3di04LjI2YTIuODcgMi44NyAwIDAgMC0yLjg3LTIuODdoLTEuMzFhMSAxIDAgMCAwLS45Mi41NjlaIi8+PHBhdGggZD0iTTEyIDN2NiIvPjxwYXRoIGQ9Ik05IDEyaDYiLz48L3N2Zz4=',
              sizes: '192x192',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
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
