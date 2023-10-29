import type { IconFinderConfig } from './data/config.js';
import { Registry as RegistryClass } from './registry/index.js';
import { getRegistry } from './registry/storage.js';
import type { PartialRoute } from './route/types/routes.js';
import type { Router, RouterEvent } from './route/router.js';
import type { CollectionInfo } from './converters/info.js';
import type { EventCallback } from './events.js';
import type { Icon } from './misc/icon.js';
import type { CustomViewLoadCallback } from './views/custom.js';
import type { IconFinderCustomSets } from './data/custom-sets.js';
import { convertCustomSets } from './data/custom-sets.js';
import { getCollectionInfo } from './data/collections.js';

/**
 * Export data for various blocks
 */
export { type BlockType, type Block, isBlockEmpty } from './blocks/types.js';

export type { CollectionInfoBlock } from './blocks/collection-info.js';

export type { CollectionsFilterBlock } from './blocks/collections-filter.js';

export {
	type CollectionsListBlock,
	getCollectionsBlockCategories,
	getCollectionsBlockPrefixes,
	iterateCollectionsBlock,
} from './blocks/collections-list.js';

export type { FiltersBlock, FiltersFilter } from './blocks/filters.js';

export type { IconsListBlock } from './blocks/icons-list.js';

export { type PaginationBlock, showPagination, maxPage } from './blocks/pagination.js';

export type { SearchBlock } from './blocks/search.js';

/**
 * Export various types and functions that do not depend on core instance
 */
// Iconify wrapper
export { setIconify, type CoreIconifyFunctions } from './iconify/index.js';

// Provider
export type { APIProviderSource } from './data/providers.js';
export {
	addProvider,
	getProvider,
	convertProviderData,
	listProviders,
} from './data/providers.js';

// From routes
export type { PartialRoute };
export type {
	// Types
	RouteType,
	// Full route types
	FullRoute,
	FullCollectionsRoute,
	FullCollectionRoute,
	FullSearchRoute,
	FullCustomRoute,
	FullEmptyRoute,
	// Partial route types
	PartialCollectionsRoute,
	PartialCollectionRoute,
	PartialSearchRoute,
	PartialCustomRoute,
	PartialEmptyRoute,
} from './route/types/routes.js';
export { objectToRoute } from './route/convert.js';

// From router
export type { Router, RouterEvent };

// From registry
export type Registry = RegistryClass;

// From collections info
export type { CollectionsInfoStorage } from './data/collections.js';
export type { CollectionInfo };
export { getCollectionInfo };
export { getCollectionTitle } from './data/collections.js';

// From config
export type { IconFinderConfig };
export {
	customisedConfig,
	mergeConfig,
	setComponentsConfig,
} from './data/config.js';

// From views
export type { ViewBlocks } from './views/types.js';
export type { CollectionsViewBlocks } from './views/collections.js';
export type { CollectionViewBlocks } from './views/collection.js';
export type { SearchViewBlocks } from './views/search.js';
export type { IconsList, CustomViewBlocks } from './views/custom.js';

// From icons
export type { Icon };
export {
	iconToString,
	validateIcon,
	compareIcons,
	stringToIcon,
} from './misc/icon.js';

// Custom sets
export type { IconFinderCustomSets };

// Objects
export { compareObjects, cloneObject } from './misc/objects.js';

/**
 * Icon Finder core parameters
 */
export interface IconFinderCoreParams {
	// Namespace. Used to share configuration and API cache between instances. Defaults to 'iconify'
	namespace?: string;

	// Custom configuration
	config?: IconFinderConfig;

	// Default route. Null if no route should be set
	route?: PartialRoute | null;

	// Custom icon sets
	iconSets?: IconFinderCustomSets;

	// Callback for view updates
	callback: (data: RouterEvent, core: IconFinderCore) => void;

	// Callbacks for loading data
	custom?: {
		[index: string]: (callback: CustomViewLoadCallback) => void;
	};
}

/**
 * Icon Finder Core class
 */
export class IconFinderCore {
	protected readonly params: IconFinderCoreParams;
	public readonly registry: Registry;
	public readonly router: Router;
	public readonly id: string;

	constructor(params: IconFinderCoreParams) {
		this.params = params;

		// Get Registry instance
		const registry = (this.registry = new RegistryClass(params));
		this.id = registry.id;
		registry.setCustom('core', this, true);

		// Set custom icon sets
		if (params.iconSets) {
			registry.customIconSets = convertCustomSets(params.iconSets);
			// console.log('Custom sets:', registry.customIconSets);
		}

		// Get other required classes from Registry
		const router = (this.router = registry.router);
		const events = registry.events;

		// Subscribe to events
		events.subscribe('render', this._routerEvent.bind(this));
		if (typeof params.custom === 'object' && params.custom !== null) {
			Object.keys(params.custom).forEach((customType) => {
				events.subscribe(
					'load-' + customType,
					(this._loadCustomIconsEvent.bind(
						this,
						customType
					) as unknown) as EventCallback
				);
			});
		}

		// Change route on next tick, so callback would be called asynchronously
		setTimeout(() => {
			if (router.fullRoute === null) {
				if (params.route !== void 0) {
					// Set route. On null or failure router will call home()
					router.partialRoute = params.route;
				} else {
					router.home();
				}
			}
		});
	}

	/**
	 * Get collection information
	 */
	getCollection(provider: string, prefix: string): CollectionInfo | null {
		return getCollectionInfo(this.registry.collections, provider, prefix);
	}

	/**
	 * Event was fired by router
	 */
	_routerEvent(data: unknown): void {
		this.params.callback(data as RouterEvent, this);
	}

	/**
	 * Load data
	 */
	_loadCustomIconsEvent(
		customType: string,
		callback: CustomViewLoadCallback
	): void {
		if (this.params.custom === void 0) {
			return;
		}
		this.params.custom[customType](callback);
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		this.registry.destroy();
	}
}

/**
 * Find Icon Finder Core instance for id
 */
export function getCoreInstance(id: string): IconFinderCore | undefined {
	const registry = getRegistry(id);
	return registry
		? (registry.getCustom('core', true) as IconFinderCore)
		: void 0;
}
