import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter()
    },
    prerender: {
        handleHttpError: ({ path, referrer, message }) => {
          // 이미지 404 에러 무시
          if (message.includes('404')) {
            return;
          }
          throw new Error(message);
        }
      },
    preprocess: vitePreprocess()
};

export default config;