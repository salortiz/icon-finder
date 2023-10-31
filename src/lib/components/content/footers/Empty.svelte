<script lang="ts">
	import type { Icon, FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '$lib/wrapper/registry.js';
	import { getContext } from 'svelte';
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	// Selected icons
	export let icons: Icon[];
	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const { showButtons, footerButtons } = registry.config.finder;

	export let route: FullRoute;
</script>

{#if showButtons || icons.length}
	<Block type="footer">
		<ButtonsContainer {icons} {route} {footerButtons}/>
	</Block>
{/if}
