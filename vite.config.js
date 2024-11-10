import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/apis': {
                target: 'http://${process.env.VITE_PUBLIC_IP}:8000',
                changeOrigin: true,
                rewrite: (path) => path,
                secure: false,
            }
        }
    },
    ssr: {
        noExternal: ['chart.js', '@sveltejs/kit/**']
    },
    optimizeDeps: {
        include: ['d3', 'topojson-client', 'jspdf', 'papaparse']
    }
});