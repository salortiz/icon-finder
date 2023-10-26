<script lang="ts">
	import type { Icon, FullRoute } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { getContext } from 'svelte';
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	// Selected icons
	export let icons: Icon[];
	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const { showButtons, footerButtons } = registry.config.finder;

	// Callback
	// export let customise: (
	// 	key: keyof IconCustomisations,
	// 	value: unknown
	// ) => void;

	// Customisations
	// export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;
</script>

{#if showButtons}
	<Block type="footer">
		<ButtonsContainer {icons} {route} {footerButtons}/>
	</Block>
{/if}
