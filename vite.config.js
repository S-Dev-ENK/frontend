import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        proxy: {
            '/apis': {
                target: 'https://enk-api.com',
                changeOrigin: true,
                rewrite: (path) => path, //.replace(/^\/apis/, ''),
                secure: false,
            }
        }
    }
});