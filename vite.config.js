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
                target: 'https://enk-api.com',
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