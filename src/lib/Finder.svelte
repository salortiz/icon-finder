<script lang="ts" context="module">
	import type { IconFinderWrapperParams } from "./wrapper/params";
	import type { FinderOptions } from "./config/components";
	type FinderCallback = IconFinderWrapperParams['callback'];
	export type { FinderCallback, FinderOptions};
	import { onMount } from 'svelte';
	import { Wrapper } from './wrapper';
	export type FinderCtrl = Wrapper;
</script>
<script lang="ts">
	import "./style/style.scss";

	export let finder: FinderCtrl | null = null;
	// With defaults if caller don't set any
	export let finderOpts: FinderOptions = {};
	export let callback: FinderCallback = (event) => {
		console.log('Event:', event);
	};
	let container: HTMLDivElement;
	onMount(() => {
		if (container) {
			finder = new Wrapper({
				container,
				callback,
				finder: finderOpts
			});
		}

	});
</script>

<!-- Icon Finder -->
<div bind:this={container} />
