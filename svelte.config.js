//import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
//import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess';
export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: [
	vitePreprocess(),
	//sveltePreprocess()
  ],
  //kit: { adapter: adapter() }
}
