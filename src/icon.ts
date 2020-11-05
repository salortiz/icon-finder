/**
 * Base icon
 */
interface BaseIcon {
	readonly provider: string;
	readonly prefix: string;
	readonly name: string;
}

/**
 * Optional data used to categorise it
 */
interface IconArrays {
	// For categories
	tags?: string[];
	themePrefixes?: string[];
	themeSuffixes?: string[];

	// Extra icon information
	aliases?: string[];
	chars?: string[];
}

/**
 * Icon interface
 */
export interface Icon extends BaseIcon, IconArrays {}

/**
 * Expression to test part of icon name.
 */
export const match = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Convert string to Icon object.
 */
export const stringToIcon = (value: string, provider = ''): Icon | null => {
	const colonSeparated = value.split(':');

	// Check for provider with correct '@' at start
	if (value.slice(0, 1) === '@') {
		// First part is provider
		if (colonSeparated.length < 2 || colonSeparated.length > 3) {
			// "@provider:prefix:name" or "@provider:prefix-name"
			return null;
		}
		provider = (colonSeparated.shift() as string).slice(1);
	}

	// Check split by colon: "prefix:name", "provider:prefix:name"
	if (colonSeparated.length > 3 || !colonSeparated.length) {
		return null;
	}
	if (colonSeparated.length > 1) {
		// "prefix:name"
		const name = colonSeparated.pop() as string;
		const prefix = colonSeparated.pop() as string;
		return {
			// Allow provider without '@': "provider:prefix:name"
			provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
			prefix,
			name,
		};
	}

	// Attempt to split by dash: "prefix-name"
	const dashSeparated = colonSeparated[0].split('-');
	if (dashSeparated.length > 1) {
		return {
			provider: provider,
			prefix: dashSeparated.shift() as string,
			name: dashSeparated.join('-'),
		};
	}

	return null;
};

/**
 * Check if icon is valid.
 *
 * This function is not part of stringToIcon because validation is not needed for most code.
 */
export const validateIcon = (icon: Icon | null): boolean => {
	if (!icon) {
		return false;
	}

	return !!(
		(icon.provider === '' || icon.provider.match(match)) &&
		icon.prefix.match(match) &&
		icon.name.match(match)
	);
};

/**
 * Compare Icon objects.
 *
 * Note: null means icon is invalid, so null to null comparison = false.
 */
export const compareIcons = (
	icon1: Icon | null,
	icon2: Icon | null
): boolean => {
	return (
		icon1 !== null &&
		icon2 !== null &&
		icon1.provider === icon2.provider &&
		icon1.name === icon2.name &&
		icon1.prefix === icon2.prefix
	);
};

/**
 * Convert icon to string.
 */
export const iconToString = (icon: Icon): string => {
	return (
		(icon.provider === '' ? '' : '@' + icon.provider + ':') +
		icon.prefix +
		':' +
		icon.name
	);
};
