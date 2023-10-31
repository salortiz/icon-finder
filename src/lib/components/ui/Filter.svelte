<script lang="ts">
	import type { FiltersFilter } from '@iconify/search-core';
	import { maxIndex } from '$lib/config/theme.js';

	// True if filter is active
	export let active: boolean = false;

	// True if at least one filter in block is active
	export let hasActive: boolean = false;

	// Filter data
	export let filter: FiltersFilter;

	// Title
	export let title: string;

	// Callback
	export let onClick: () => void;

	// Link
	export let link: string = '# ';

	// Get class name
	const baseClass = 'iif-filter';
	let className: string;
	$: {
		className =
			baseClass +
			(active
				? ' ' + baseClass + '--selected'
				: hasActive
				? ' ' + baseClass + '--unselected'
				: '') +
			(filter.index
				? ' ' + baseClass + '--' + (filter.index % maxIndex)
				: '');
	}
</script>

{#if link}
	<a
		class={className}
		on:click|preventDefault={onClick}
		href={link}>{title}</a>
{:else}
	<button
		class={className}
		disabled={filter.disabled}
		on:click|preventDefault={onClick}>
		{title}
	</button>
{/if}
