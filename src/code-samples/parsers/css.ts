import type { IconCustomisations } from '../../misc/customisations.js';
import type { Icon } from '../../misc/icon.js';
import type { CodeSampleAPIConfig } from '../types.js';
import {
	addAttr,
	degrees,
	docsBase,
	getCustomisationsList,
	mergeAttr,
	type ParserAttr,
	toString,
} from './common.js';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types.js';

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'css',
	href: docsBase + 'css.html',
};

/**
 * Code output for CSS
 */
export const cssParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (typeof providerConfig.svg !== 'string') {
		return null;
	}

	// Parse all customisations
	const list: ParserAttr = {};
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			// Ignore
			case 'inline':
				break;

			// Color
			case 'color':
				addAttr(list, 'color', customisations[attr]);
				break;

			// Dimensions
			case 'width':
			case 'height':
				addAttr(list, attr, toString(customisations[attr]));
				break;

			case 'onlyHeight':
				addAttr(list, 'height', toString(customisations.height));
				break;

			// Transformations
			case 'rotate':
				addAttr(list, attr, degrees(customisations[attr]));
				break;

			case 'hFlip':
				mergeAttr(list, 'flip', 'horizontal', ',');
				break;

			case 'vFlip':
				mergeAttr(list, 'flip', 'vertical', ',');
				break;
		}
	});

	// Generate params
	const params = Object.keys(list)
		.map((key) => {
			const item = list[key];
			if (typeof item === 'object') {
				return item.key + '=' + encodeURIComponent(item.value || '');
			}
			return key + '=' + encodeURIComponent(item);
		})
		.join('&');

	// Get URL
	const url =
		providerConfig.svg
			.replace('{prefix}', icon.prefix)
			.replace('{name}', icon.name) + (params ? '?' + params : '');

	const result: CodeOutput = {
		raw: [
			"background: url('" + url + "') no-repeat center center / contain;",
			"content: url('" + url + "');",
		],
		isAPI: true,
		docs,
	};
	return result;
};
