<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import IconComponent, { iconExists, loadIcons } from '@iconify/svelte';
	import type { FullRoute, Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { WrappedRegistry } from '$lib/wrapper/registry.js';
	import { phrases } from '$lib/config/phrases.js';
	import Input from '$lib/components/ui/Input.svelte';
	import type {MyExtras} from '../../Review.svelte';

	// Selected icon
	export let icon: Icon;

	// Current route
	// export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const extras = registry.extras as MyExtras;

	// Current value
	let iconName = iconToString(icon);
	let lastIconName: string;
	let value: string;
	$: { const niconN = iconToString(icon);
		console.log('SI', niconN);
		if(value == null || iconName != niconN) {
			iconName = niconN;
	    	lastIconName = extras.shortnames[iconName];
			value = lastIconName
		}
	}
	$: { console.log('CV', value) }

	// Test new icon name
	function testNewValue() {
		if(!value) // Reset
			value = iconName.replace(':','_');
		else if(lastIconName != value) {
			// TODO Validate value valid...
			console.log(`Aliasing ${iconName} as ${value}`)
			lastIconName = extras.shortnames[iconName] = value;
		}
	}

	// Remove event listener
	onDestroy(() => {
	});
</script>

<form
	on:submit|preventDefault={testNewValue}
	class="iif-footer-icon-name iif-footer-icon-name--simple
		iif-footer-icon-name--simple--editable">
	<dl>
		<dt>{phrases.footer.iconName}</dt>
		<dd>
			<IconComponent icon={iconName} />
			<Input
				bind:value
				onBlur={testNewValue}
				placeholder={phrases.footer.iconNamePlaceholder} />
		</dd>
	</dl>
</form>
