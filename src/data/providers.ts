import type {
	APIProviderRawDataLinks,
	APIProviderRawDataNPM,
	APIProviderRawData,
} from '@iconify/types/provider.js';
import type { IconifyAPIConfig, PartialIconifyAPIConfig } from '@iconify/iconify';
import { initRedundancy } from '@iconify/api-redundancy';
import type { Redundancy } from '@iconify/api-redundancy';
import { Iconify } from '../iconify/index.js';
import { matchIconName } from '@iconify/utils/lib/icon/name';

// Export imported types
export type { APIProviderRawDataLinks, APIProviderRawDataNPM, APIProviderRawData };

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * Default values
 */
const defaultAPIDataLinks: Required<APIProviderRawDataLinks> = {
	home: '',
	collection: '',
	icon: '',
};

const defaultAPIDataNPM: Required<APIProviderRawDataNPM> = {
	package: '',
	icon: '',
};

const defaultAPIData: Required<APIProviderRawData> = {
	// These variables will be automatically set if empty
	provider: '',
	title: '',
	api: '',

	// Optional
	links: defaultAPIDataLinks,
	npm: defaultAPIDataNPM,
	svg: '',
};

/**
 * API provider interface
 */
// Common fields
interface APIProviderData {
	title: string;

	// Links for HTML pages
	links: Required<APIProviderRawDataLinks>;

	// NPM packages configuration
	npm: Required<APIProviderRawDataNPM>;

	// URL for SVG generator
	svg: string;
}

// Interface with API configuration
export interface APIProviderSource extends APIProviderData {
	config: Partial<IconifyAPIConfig>;
}

// Interface with Redundancy instance
export interface APIProviderConfigured extends APIProviderData {
	config: IconifyAPIConfig;
	redundancy: Redundancy;
}

/**
 * Local cache
 */
// Exported to allow quick manipulation of links. Not meant to be used in any other way
export const internalSourceCache: Record<
	string,
	APIProviderSource
> = Object.create(null);
const configuredCache: Record<
	string,
	APIProviderConfigured | null
> = Object.create(null);

// Add default provider
const iconifyRoot = 'https://icon-sets.iconify.design/';
const iconifyPackage = '@iconify/icons-{prefix}';
internalSourceCache[''] = {
	config: {},
	title: 'Iconify',
	links: {
		home: iconifyRoot,
		collection: iconifyRoot + '{prefix}/',
		icon: iconifyRoot + '{prefix}/{name}/',
	},
	npm: {
		package: iconifyPackage,
		icon: iconifyPackage + '/{name}',
	},
	svg: 'https://api.iconify.design/{prefix}/{name}.svg',
};

/**
 * Defaults
 */
const defaults: APIProviderData = {
	title: '',
	links: defaultAPIDataLinks,
	npm: defaultAPIDataNPM,
	svg: '',
};

/**
 * Convert data returned from API
 */
export function convertProviderData(
	host: string,
	raw: APIProviderRawData
): APIProviderSource | null {
	const provider = raw.provider;
	if (
		typeof provider !== 'string' ||
		// Allow empty string
		(provider !== '' && !provider.match(matchIconName))
	) {
		return null;
	}

	// Clean up raw data
	const data: Partial<APIProviderRawData> = {};
	for (const key in defaultAPIData) {
		const attr = key as keyof APIProviderRawData;

		switch (attr) {
			case 'title':
				data.title =
					typeof raw.title === 'string' ? raw.title : provider;
				break;

			case 'provider':
				data.provider = provider;
				break;

			case 'api':
				if (typeof raw.api === 'string' && raw.api !== '') {
					data.api = [raw.api];
				} else if (raw.api instanceof Array) {
					data.api = raw.api;
				} else if (host === '') {
					// Missing host
					return null;
				} else {
					data.api = [host];
				}
				break;

			case 'npm':
			case 'links': {
				const defaultValue = defaultAPIData[
					attr
				] as APIProviderRawDataLinks;
				let resultValue: APIProviderRawDataLinks;

				if (typeof raw[attr] !== 'object' || !raw[attr]) {
					// Copy default value
					resultValue = defaultValue;
				} else {
					const rawValue = raw[attr] as APIProviderRawDataLinks;

					// Merge values
					resultValue = {};
					for (const nestedKey in defaultValue) {
						const nestedAttr = nestedKey as keyof APIProviderRawDataLinks;
						if (typeof rawValue[nestedAttr] === 'string') {
							resultValue[nestedAttr] = rawValue[nestedAttr];
						} else {
							resultValue[nestedAttr] = defaultValue[nestedAttr];
						}
					}
				}
				data[attr] = resultValue;
				break;
			}

			case 'svg':
				data[attr] =
					typeof raw[attr] === 'string'
						? raw[attr]
						: defaultAPIData[attr];
				break;

			default:
				assertNever(attr);
		}
	}
	const fullData = data as Required<APIProviderRawData>;

	// Create API config
	const config: Partial<IconifyAPIConfig> = {
		resources: fullData.api as string[],
	};

	// Create data
	const result: APIProviderSource = {
		config,
		title: fullData.title,
		links: fullData.links as Required<APIProviderRawDataLinks>,
		npm: fullData.npm as Required<APIProviderRawDataNPM>,
		svg: '',
	};

	return result;
}

function getAPI(provider: string)  {
	const redun = Iconify.getAPIConfig ? Iconify.getAPIConfig(provider) : void 0
	if(!redun) return;
	const config = {path: redun.path, maxURL: redun.maxURL};
	return {redundancy: initRedundancy(redun), config };
}
/**
 * Get API provider
 */
export function getProvider(provider: string): APIProviderConfigured | null {
	if (configuredCache[provider] === void 0) {
		if (internalSourceCache[provider] === void 0) {
			// Missing provider
			return null;
		}

		const source = internalSourceCache[provider];

		// Get Redundancy instance from Iconify
		const data = getAPI(provider);
		if (data === void 0) {
			// Failed again - something is wrong with config
			configuredCache[provider] = null;
		} else {
			configuredCache[provider] = {
				config: data.config,
				redundancy: data.redundancy,
			} as APIProviderConfigured;

			// Add missing fields
			const cache = (configuredCache[provider] as unknown) as Record<
				string,
				unknown
			>;
			const src = (source as unknown) as Record<string, unknown>;
			for (const key in defaults) {
				if (src[key] !== void 0) {
					cache[key] = src[key];
				} else {
					cache[key] = ((defaults as unknown) as Record<
						string,
						unknown
					>)[key];
				}
			}
		}
	}

	return configuredCache[provider];
}

/**
 * Add provider
 */
export function addProvider(provider: string, config: APIProviderSource): void {
	if (!Iconify.addAPIProvider || internalSourceCache[provider] !== void 0) {
		// addAPIProvider is not set or cannot overwrite provider
		return;
	}
	if (config.title === void 0) {
		// Use provider as name
		config.title = provider;
	}
	internalSourceCache[provider] = config;
	Iconify.addAPIProvider(provider, config.config as PartialIconifyAPIConfig);
}

/**
 * Get all providers
 */
export function listProviders(): string[] {
	return Object.keys(internalSourceCache).sort();
}
