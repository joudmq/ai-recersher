import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@base-ui/react/button',
        '@base-ui/react/input',
        '@base-ui/react/merge-props',
        '@base-ui/react/select',
        '@base-ui/react/separator',
        '@base-ui/react/tabs',
        '@base-ui/react/use-render',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-react',
        'motion/react',
        'react-markdown',
        'docx',
        'file-saver',
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
