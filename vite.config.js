import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

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
    optimizeDeps: {
        include: ['d3', 'topojson-client']
    }
});