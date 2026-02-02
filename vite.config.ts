import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, cpSync, mkdirSync } from 'fs';

// Plugin to copy public files to dist
function copyPublicFiles() {
  return {
    name: 'copy-public-files',
    closeBundle() {
      // Copy manifest.json
      copyFileSync('public/manifest.json', 'dist/manifest.json');
      
      // Copy icons directory
      mkdirSync('dist/icons', { recursive: true });
      cpSync('public/icons', 'dist/icons', { recursive: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicFiles()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@popup': resolve(__dirname, './src/popup'),
      '@content': resolve(__dirname, './src/content'),
      '@background': resolve(__dirname, './src/background'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'public/sidepanel.jsx'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/service-worker.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content/content.js';
          }
          if (chunkInfo.name === 'sidepanel') {
            return 'sidepanel.js';
          }
          return '[name]/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sidepanel.css') {
            return 'sidepanel.css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
});
