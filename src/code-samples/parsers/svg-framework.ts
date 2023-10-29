import type { IconCustomisations } from '../../misc/customisations.js';
import { type Icon, iconToString } from '../../misc/icon.js';
import type { CodeSampleAPIConfig } from '../types.js';
import { iconifyVersion } from '../versions.js';
import {
	addAttr,
	degrees,
	docsBase,
	getCustomisationsList,
	isNumber,
	mergeAttr,
	mergeAttributes,
	type ParserAttr,
	toString,
} from './common.js';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types.js';

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'iconify',
	href: docsBase + 'svg-framework/',
};

// Head section
let head: string | undefined;

/**
 * Code output for SVG Framework
 */
export const svgFrameworkParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (!providerConfig.api) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add class
	addAttr(
		list,
		'class',
		customisations.inline ? 'iconify-inline' : 'iconify'
	);

	// Add icon name
	addAttr(list, 'data-icon', iconToString(icon));

	// Parse all customisations
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			// Color
			case 'color':
				mergeAttr(
					list,
					'style',
					'color: ' + customisations[attr] + ';',
					' '
				);
				break;

			// Dimensions
			case 'width':
				addAttr(list, 'data-width', toString(customisations[attr]));
				break;

			case 'onlyHeight': {
				const value = customisations.height;
				mergeAttr(
					list,
					'style',
					'font-size: ' + value + (isNumber(value) ? 'px;' : ';'),
					' '
				);
				break;
			}

			case 'height':
				addAttr(list, 'data-height', toString(customisations[attr]));
				break;

			// Transformations
			case 'rotate':
				addAttr(list, 'data-rotate', degrees(customisations[attr]));
				break;

			case 'hFlip':
				mergeAttr(list, 'data-flip', 'horizontal', ',');
				break;

			case 'vFlip':
				mergeAttr(list, 'data-flip', 'vertical', ',');
				break;
		}
	});

	// Generate HTML
	const html = '<span ' + mergeAttributes(list) + '></span>';

	// Head script
	if (head === void 0) {
		head =
			'<script src="https://code.iconify.design/' +
			iconifyVersion.split('.').shift() +
			'/' +
			iconifyVersion +
			'/iconify.min.js"><' +
			'/script>';
	}

	const result: CodeOutput = {
		html: {
			head,
			html,
		},
		isAPI: true,
		docs,
	};
	return result;
};
