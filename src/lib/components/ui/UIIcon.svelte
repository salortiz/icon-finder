<script context="module" lang="ts">
	let firstMount = true;
	let allLoaded = false;
</script>

<script lang="ts">
	import Icon, { loadIcons } from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { icons, iconsClass } from '$lib/config/theme.js';

	// Icon to render
	export let icon: string;

	// Optional event to trigger when icon has loaded
	export let onLoad: (() => void) | null = null;

	// Loaded status
	let loaded = false;

	function loadCallback() {
		loaded = true;
		if (onLoad) {
			onLoad();
		}
	}

	// Preload icons only after mount, which is not used in SSR
	onMount(() => {
		if (firstMount) {
			firstMount = false;
			loadIcons(
				Object.values(icons).filter((name) => !!name) as string[],
				(l) => { if(l.length) allLoaded = true }
			);
		}
		else if(allLoaded) // Syntetize bc its awaited
			loadCallback();
	});

	// Resolve icon name
	let iconName: string | null;
	$: {
		iconName =
			typeof icons[icon] === 'string'
				? icons[icon]
				: icon.indexOf(':') === -1
				? null
				: icon;
	}
</script>

{#if iconName !== null}
	<Icon
		icon={iconName}
		class={iconsClass}
		on:load={loadCallback} />
	{#if !loaded}
		<slot />
	{/if}
{:else}
	<slot />
{/if}
