import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        proxy: {
            '/apis': {
                target: 'https://enk-api.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/apis/, '')
            }
        }
    }
});