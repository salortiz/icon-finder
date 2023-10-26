import type { FooterButton, FooterButtonCallbackParams } from '../footer/types';

export type FinderConfig = {
	showProviders: boolean,
	canAddProviders: boolean,
	canFocusSearch: false | (() => boolean),
	showCollectionInfoBlock: boolean,
	canShortenIconName: boolean,
	showFooterBlockTitles: boolean,
	canToggleFooterBlocks: boolean,
	showInfoInFooter: boolean,
	showCustomisatons: boolean,
	customiseColor: boolean,
	customiseWidth: boolean,
	customiseHeight: boolean,
	customiseRotate: boolean,
	customiseFlip: boolean,
	customiseInline: boolean,
	showButtons: boolean,
	footerButtons: Record<string, FooterButton>,
	showCode: false
}
export type FinderOptions = Partial<FinderConfig>;

/**
 * Can show and add API providers?
 */
const showProviders = false;
const canAddProviders = false;

/**
 * Automatically focus search
 *
 * Do not change value to true, comment out code below it. It checks for mobile devices
 */
const canFocusSearch = false;

/*
export const canFocusSearch = (() => {
	try {
		return (
			window.matchMedia('(min-width: 600px) and (min-height: 600px)')
				.matches &&
			// Do not focus if touch device is detected
			!('ontouchstart' in window)
		);
	} catch (err) {
		return false;
	}
})();
*/

/**
 * Show collection information block (author, license, etc...) when browsing collection
 *
 * Also see showInfoInFooter below (need to set both to false to disable icon set info block)
 */
const showCollectionInfoBlock = true;

/**
 * Can shorten icon name in footer?
 */
const canShortenIconName = true;

/**
 * Show title for footer blocks?
 */
const showFooterBlockTitles = false;

/**
 * Toggle footer blocks?
 */
const canToggleFooterBlocks = false;

/**
 * Show info block in footer?
 *
 * Block will show information about icon set for selected icon.
 *
 * When multiple icons are selected, block will be shown only when all icons have the same prefix.
 *
 * When browsing icon set, block will be shown only if block above icons
 * list is not shown or when prefix is different or showCollectionInfoBlock is disabled.
 */
const showInfoInFooter = true;

/**
 * List of properties to customise
 */
// Global toggle: disables all properties
const showCustomisatons = true;

// Color
const customiseColor = true;

// Size
const customiseWidth = true;
const customiseHeight = true;

// Rotation
const customiseRotate = true;

// Flip
const customiseFlip = true;

// Inline / block
const customiseInline = false;

/**
 * Default values for color, width and height
 */
export const defaultColor = '#000';
export const defaultWidth = '';
export const defaultHeight = '';

/**
 * Limits for sample icon in footer
 */
export const iconSampleSize = {
	width: 200,
	height: 300,
};

/**
 * Footer buttons
 */
const showButtons = false; // Show even when no icons selected

const footerButtons: Record<string, FooterButton> = {
	submit: {
		type: 'primary',
		display: 'icons', // Show only when icon(s) have been selected
	},
	cancel: {
		type: 'secondary',
	},
};

/**
 * Sample code
 * Generate insructions for diferent environments
 */
// To disable code block, also change link for CodeBlock to Empty.svelte in ../components/content/footer/*.svelte (it will remove component from bundle)
const showCode = false;

export const finderDefaultConfig: FinderConfig = {
	showProviders,
	canAddProviders,
	canFocusSearch,
	showCollectionInfoBlock,
	canShortenIconName,
	showFooterBlockTitles,
	canToggleFooterBlocks,
	showInfoInFooter,
	showCustomisatons,
	customiseColor,
	customiseWidth,
	customiseHeight,
	customiseRotate,
	customiseFlip,
	customiseInline,
	showButtons,
	footerButtons,
	showCode
}
