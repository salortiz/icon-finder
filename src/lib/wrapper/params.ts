import type { IconifyJSON } from '@iconify/types';
import type { IconFinderCustomSets } from '@iconify/search-core';
import type { IconFinderEvent } from './events';
import type { InitialIconFinderState } from './state';
import type { FinderOptions } from '$lib/config/components';

/**
 * Wrapper parameters
 */
export interface IconFinderWrapperParams {
	// Container node
	container: HTMLElement;

	// Custom icon sets
	iconSets?: IconFinderCustomSets | IconifyJSON[];

	// Default state
	state?: Partial<InitialIconFinderState>;

	// Finder components config
	finder?: FinderOptions

	// Callback
	callback: (event: IconFinderEvent) => void;
}
