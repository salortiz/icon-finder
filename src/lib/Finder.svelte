<script lang="ts">
	import "../app.scss";
	import { onMount } from 'svelte';
	import { Wrapper } from './wrapper';

	let container: HTMLDivElement;
	onMount(() => {
		if (container) {
			const wrapper = new Wrapper({
				container,
				callback: (event) => {
					console.log('Event:', event);
				}
			});
		}

	});
</script>

<div bind:this={container} />
