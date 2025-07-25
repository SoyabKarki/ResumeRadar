import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'background.js', dest: '.' },
        { src: 'content.js', dest: '.' }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        content: resolve(__dirname, 'content.js')
      },
      external: ['fsevents']
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
