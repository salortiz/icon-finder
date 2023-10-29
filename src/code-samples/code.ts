import type { IconCustomisations } from '../misc/customisations.js';
import type { Icon } from '../misc/icon.js';
import type { CodeSampleAPIConfig, CodeSampleMode } from './types.js';
import type {
	CodeOutput,
	CodeParser,
	ComponentCodeOutput,
} from './parsers/types.js';
import { cssParser } from './parsers/css.js';
import { emberParser } from './parsers/ember.js';
import { reactOfflineParser, reactParser } from './parsers/react.js';
import { svelteOfflineParser, svelteParser } from './parsers/svelte.js';
import { svgParser } from './parsers/svg.js';
import { svgFrameworkParser } from './parsers/svg-framework.js';
import { webComponentParser } from './parsers/iconify-icon.js';
import { vueOfflineParser, vueParser } from './parsers/vue.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

// Re-export types
export type { CodeOutput, ComponentCodeOutput };

/**
 * Output
 */
export const codeOutputComponentKeys: (keyof ComponentCodeOutput)[] = [
	'install-simple',
	'install-addon',
	'install-offline',
	'import-simple',
	'import-offline',
	'vue-simple',
	'vue-offline',
	// Usage
	'use-in-code',
	'use-in-template',
	'use-in-html',
	'use-generic',
];

/**
 * Get code for icon
 */
export function getIconCode(
	lang: CodeSampleMode,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
	let parser: CodeParser;

	switch (lang) {
		// IconifyIcon
		case 'iconify-icon':
			parser = webComponentParser;
			break;

		// SVG Framework
		case 'iconify':
			parser = svgFrameworkParser;
			break;

		// CSS
		case 'css':
			parser = cssParser;
			break;

		// React
		case 'react-api':
			parser = reactParser;
			break;

		case 'react-offline':
			parser = reactOfflineParser;
			break;

		// Vue
		case 'vue2-api':
			parser = vueParser.bind(null, false);
			break;

		case 'vue2-offline':
			parser = vueOfflineParser.bind(null, false);
			break;

		case 'vue3-api':
			parser = vueParser.bind(null, true);
			break;

		case 'vue3-offline':
			parser = vueOfflineParser.bind(null, true);
			break;

		// Svelte
		case 'svelte-api':
			parser = svelteParser;
			break;

		case 'svelte-offline':
			parser = svelteOfflineParser;
			break;

		// Ember
		case 'ember':
			parser = emberParser;
			break;

		// SVG
		case 'svg-box':
		case 'svg-raw':
		case 'svg-uri':
			parser = svgParser.bind(null, lang);
			break;

		default:
			assertNever(lang);
			return null;
	}

	return parser(icon, customisations, providerConfig);
}
