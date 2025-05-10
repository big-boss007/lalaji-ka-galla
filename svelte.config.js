import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Vercel adapter options can be configured here
			// For example, specify a runtime:
			// runtime: 'nodejs18.x' 
			// See https://kit.svelte.dev/docs/adapter-vercel for more options
		})
	}
};

export default config;
