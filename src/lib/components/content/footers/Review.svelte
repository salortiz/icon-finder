<script lang="ts" context="module">
	export type MyExtras = {
		selectedone: string,
		shortnames: Record<string, string>
	}
</script>
<script lang="ts">
	import { getContext } from 'svelte';
	import type {
		Icon,
		FullRoute,
		CollectionInfoBlock,
	} from '@iconify/search-core';
	import { iconToString, getCollectionInfo } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { WrappedRegistry } from '$lib/wrapper/registry.js';
	import { phrases } from '$lib/config/phrases.js';
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';
	import PropertiesContainer from './parts/Properties.svelte';
	import Sample from './parts/samples/Full.svelte';
	import InlineSample from './parts/samples/Inline.svelte';
	import IconsList from './parts/Icons.svelte';
	import FooterBlock from './parts/FooterBlock.svelte';
	import InfoBlock from '../blocks/CollectionInfo.svelte';

	/* Various components for icon name. */
	import { IconNameMap } from './parts/name/IconName';

	/* Switch to Empty.svelte if you do not want to show code samples block. Also see ../../config/components.ts */
	import CodeBlock from './parts/code/Container.svelte';
	// import CodeBlock from './parts/Empty.svelte';

	// Selected icons
	export let icons: Icon[];

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Customisations
	export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const extras = registry.extras as MyExtras;
	// Init my extras
	extras['selectedone'] ||= '';
	extras['shortnames'] ||= {};
	const finderConfig = registry.config.finder;
	const {
		showCollectionInfoBlock,
		showButtons,
		showInfoInFooter,
		showCustomisatons,
		showCode,
		canShortenIconName,
		customiseInline,
		footerButtons,
		footerNamer
	} = finderConfig;

	const IconName = IconNameMap[footerNamer];
	// Select icon from multiple icons
	let selected = extras['selectedone'];
	// Check if icons are selected, get selected one
	let icon: Icon | null;
	let hasIcons: boolean;
	$: {
		hasIcons = icons.length > 0;
		if(hasIcons) {
			icon = null;
			if (selected !== '') {
				// Find selected icon
				for (let i = 0; i < icons.length; i++) {
					if (iconToString(icons[i]) === selected) {
						icon = icons[i];
						break;
					}
				}
			}
		}
		else icon = null;
	}

	function onSelect(selection: Icon): void {
		const clicked = iconToString(selection);
		if(clicked == selected) {
			selected = '';
			icon = null;
		} else {
			selected = clicked;
			extras['shortnames'][selected] ||= selected.replaceAll(':', '_');
			icon = selection;
		}
		extras['selectedone'] = selected;
	}

	// Check if info block should be shown
	let infoBlock: CollectionInfoBlock | null;
	let infoBlockTitle: string;
	$: {
		let showInfo = true;

		// Get provider and prefix for info
		let provider = '';
		let prefix = '';
		if (!showInfoInFooter || !hasIcons) {
			// Disabled
			showInfo = false;
		} else if (icon) {
			// One icon is selected: show info for that icon
			provider = icon.provider;
			prefix = icon.prefix;
		} else {
			// Multiple icons are selected: show info if all of them have the same prefix
			for (let i = 0; i < icons.length; i++) {
				const icon = icons[i];
				if (!i) {
					prefix = icon.prefix;
					provider = icon.provider;
					continue;
				}
				if (icon.provider !== provider || icon.prefix !== prefix) {
					showInfo = false;
					break;
				}
			}
		}

		// Check route
		if (
			showCollectionInfoBlock &&
			showInfo &&
			route.type === 'collection' &&
			provider === route.params.provider &&
			prefix === route.params.prefix
		) {
			// Already showing info for the same icon set above icons list
			showInfo = false;
		}

		// Get data
		if (showInfo) {
			const info = getCollectionInfo(
				registry.collections,
				provider,
				prefix
			);
			if (!info) {
				infoBlock = null;
				infoBlockTitle = '';
			} else {
				infoBlock = {
					type: 'collection-info',
					prefix,
					info,
				};
				infoBlockTitle = phrases.footer.about.replace(
					'{title}',
					info.name
				);
			}
		} else {
			infoBlock = null;
			infoBlockTitle = '';
		}
	}
</script>

{#if showButtons || hasIcons}
	<Block type="footer">
		{#if hasIcons}
			<IconsList {route} {icons} {customisations} {selected} {onSelect} />
		{/if}
		{#if icon}
			<IconName {icon} {route} {canShortenIconName}/>
		{/if}
		<div class={icon ? 'iif-footer-full' : ''}>
			{#if icon}
				{#if customiseInline && customisations.inline}
					<InlineSample {icon} {customisations} />
				{:else}
					<Sample {icon} {customisations} />
				{/if}
			{/if}
			<div class={icon ? 'iif-footer-full-content' : ''}>
				{#if infoBlock}
					<FooterBlock name="info" title={infoBlockTitle}>
						<InfoBlock
							name="info"
							block={infoBlock}
							short={true}
							showTitle={false} />
					</FooterBlock>
				{/if}
				{#if showCustomisatons && hasIcons}
					<PropertiesContainer {icons} {customise} {customisations} {finderConfig}/>
				{/if}
				{#if showCode && icon}
					<CodeBlock {icon} {customisations} />
				{/if}
				{#if showButtons || hasIcons}
					<ButtonsContainer {footerButtons} {icons} {route} />
				{/if}
			</div>
		</div>
	</Block>
{/if}
