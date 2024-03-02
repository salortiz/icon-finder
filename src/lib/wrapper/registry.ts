import type { Registry } from '@iconify/search-core';
import type { FullIconFinderConfig } from '@iconify/search-core/lib/data/config';
import type { UIEvent } from '../events/types.js';
import type { ComponentsConfig } from '../config/wrapper.js';
import type { FinderConfig } from '$lib/config/components.js';

/**
 * Add UI to config
 */
export interface WrappedFullIconFinderConfig extends FullIconFinderConfig {
	components: Required<ComponentsConfig>;
	finder: FinderConfig;
}

/**
 * Add custom properties to registry
 */
export interface WrappedRegistry extends Registry {
	callback: (event: UIEvent) => void;
	link: (event: MouseEvent) => void;
	config: WrappedFullIconFinderConfig;
	extras: Record<string, unknown>;
}
