import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/vscode-pwa-analyzer/',
  plugins: [react()],
});
