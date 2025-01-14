import type { IconifyInfo } from '@iconify/types';
import type {
	IconFinderTagsFilters,
	IconFinderThemeFilters,
} from '../../filters/types/all';
import type { IconFinderIconsListWithPaginationConfig } from '../../pagination/types/config';
import type { IconFinderIconSetIcons } from './icons';
import type { IconSetID } from './id';

/**
 * Source
 */
export type IconFinderIconSetSource = 'api' | 'raw';

/**
 * Filters: themes + tags
 */
export interface IconFinderIconSetFilters
	extends IconFinderThemeFilters,
		IconFinderTagsFilters {
	//
}

/**
 * Icon set
 */
export interface IconFinderIconSet
	extends IconFinderIconsListWithPaginationConfig {
	// Source
	source: IconFinderIconSetSource;

	// Provider and prefix
	id: IconSetID;

	// Title: duplicate of info.name
	title: string;

	// Number of visible icons: duplicate of info.total, but cannot be undefined
	total: number;

	// Information
	info: IconifyInfo;

	// Icons list
	icons: IconFinderIconSetIcons;

	// Filters
	filters: IconFinderIconSetFilters;
}
