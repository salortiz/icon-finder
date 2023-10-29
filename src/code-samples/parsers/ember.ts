import type { IconCustomisations } from '../../misc/customisations.js';
import { type Icon, iconToString } from '../../misc/icon.js';
import type { CodeSampleAPIConfig } from '../types.js';
import { getComponentInstall } from '../versions.js';
import {
	addEmberAttr,
	docsBase,
	getCustomisationsList,
	mergeAttributes,
	type ParserAttr,
} from './common.js';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types.js';

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'ember',
	href: docsBase + 'ember/',
};

// Code cache
const installCode = getComponentInstall('ember', true);

/**
 * Code output for API component
 */
export const emberParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (!providerConfig.api) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add icon name
	addEmberAttr(list, 'icon', iconToString(icon));

	// Params
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			case 'onlyHeight': {
				const value = customisations.height;
				addEmberAttr(list, 'height', value);
				break;
			}

			default:
				addEmberAttr(list, attr, customisations[attr]);
		}
	});

	// Generate code
	const code = '<IconifyIcon ' + mergeAttributes(list) + ' />';

	const result: CodeOutput = {
		component: {
			'install-addon': installCode,
			'use-in-template': code,
		},
		isAPI: true,
		docs,
	};
	return result;
};
