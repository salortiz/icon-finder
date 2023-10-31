<script lang="ts" context="module">
	/**
	 * Various footer components
	 */
	import FooterFull from './footers/Full.svelte';
	import FooterCompact from './footers/Compact.svelte';
	import FooterSimple from './footers/Simple.svelte';
	import FooterEmpty from './footers/Empty.svelte';
	import FooterNone from './footers/None.svelte'
	const FooterMap = {
		'Full': FooterFull,
		'Compact': FooterCompact,  // Similar to full, but selected icon (or icons list) is above footer, making it look nicer with small width
								// Also when multiple icons are selected, it allows selecting icon from selected icons and shows code/customisations for it
		'Empty': FooterEmpty,	// Empty footer: only buttons
		'None': FooterNone,		// No footer
		'Simple': FooterSimple	// Simple footer: no big sample
	};
	export type Footers = keyof typeof FooterMap;

</script>
<script lang="ts">
	import { onMount, getContext, onDestroy } from 'svelte';
	import { loadIcons, type IconifyIconSize } from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { SelectedIcons } from '$lib/wrapper/icons.js';
	import { selectionToArray } from '$lib/wrapper/icons.js';
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '$lib/wrapper/registry.js';

	/**
	 * Global exports
	 */
	export let selection: SelectedIcons;
	export let selectionLength: number;
	export let customisations: IconCustomisations;
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const { footer } = registry.config.finder;
	//console.log('Footer', footer);
	const Footer = FooterMap[footer] as typeof FooterSimple; // Avoid signature warning for None.

	// Change icon customisation value
	function customise(prop: keyof IconCustomisations, value: unknown) {
		// Convert empty width/height to null
		switch (prop) {
			case 'width':
			case 'height':
				if (value === '' || value === 0) {
					value = null;
				}
				break;
		}

		if (customisations[prop] !== void 0 && customisations[prop] !== value) {
			// Change value then change object to force Svelte update components
			const changed = {
				[prop]: value as string | number | null | boolean,
			};

			// Send event: UICustomisationEvent
			registry.callback({
				type: 'customisation',
				changed,
				customisations: { ...customisations, ...changed },
			});
		}
	}

	// Event listener
	let mounted = false;
	let updateCounter: number = 0;
	let abortLoader: (() => void) | null = null;
	function loadingEvent() {
		updateCounter++;
	}

	onMount(() => {
		mounted = true;
	});

	// Get list of loaded and pending icons
	let icons: Icon[];
	let pending: string[];
	$: {
		// Mention updateCounter to trigger this code when event listener is used
		updateCounter;

		// Filter icons
		icons = [];
		const newPending: string[] = [];
		const toLoad: string[] = [];

		const list = selectionLength ? selectionToArray(selection) : [];
		list.forEach((icon) => {
			const name = iconToString(icon);
			if (Iconify.getIcon?.(name)) {
				icons.push(icon);
				return;
			}

			// Icon is missing
			if (abortLoader && pending && pending.indexOf(name) !== -1) {
				// Already pending: do nothing
				newPending.push(name);
				return;
			}

			// Add icon to list of icons to load
			newPending.push(name);
			toLoad.push(name);
		});

		// Update pending list and load icons after component is mounted
		pending = newPending;
		if (toLoad.length && mounted) {
			// Load new icons
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = loadIcons(toLoad, loadingEvent);
		}
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
		}
	});
</script>

<Footer {icons} {customisations} {route} {customise} />
