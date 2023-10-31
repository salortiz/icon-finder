<script lang="ts">
	import type { FullRoute, Icon } from '@iconify/search-core';
	import IconComponent from '@iconify/svelte';
	import { iconToString } from '@iconify/search-core';
	import { shortenIconName } from '$lib/footer/shorten-icon-name.js';
	import { phrases } from '$lib/config/phrases.js';

	// Icon name
	export let icon: Icon;

	// Current route
	export let route: FullRoute;

	export let canShortenIconName: Boolean;

	// Get icon name
	let iconName = iconToString(icon);
	let text: string;
	$: {
		// Full name
		iconName = iconToString(icon);

		// Do not show prefix if viewing collection
		text = canShortenIconName
			? shortenIconName(route, icon, iconName)
			: iconName;
	}
</script>

<div class="iif-footer-icon-name iif-footer-icon-name--simple">
	<dl>
		<dt>{phrases.footer.iconName}</dt>
		<dd>
			<IconComponent icon={iconName} />
			<div class="iif-footer-icon-name-input"><span>{text}</span></div>
		</dd>
	</dl>
</div>
