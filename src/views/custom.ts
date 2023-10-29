import type { BaseViewBlocks } from './base.js';
import { BaseView } from './base.js';
import type { FullCustomRoute } from '../route/types/routes.js';
import type { IconsListBlock } from '../blocks/icons-list.js';
import { defaultIconsListBlock, applyIconFilters } from '../blocks/icons-list.js';
import type { PaginationBlock } from '../blocks/pagination.js';
import { defaultPaginationBlock, maxPage } from '../blocks/pagination.js';
import { getRegistry } from '../registry/storage.js';
import type { Icon } from '../misc/icon.js';
import { validateIcon, stringToIcon } from '../misc/icon.js';
import type { SearchBlock } from '../blocks/search.js';
import { defaultSearchBlock } from '../blocks/search.js';
import type { View } from './types.js';
import { cloneObject } from '../misc/objects.js';

/**
 * Blocks
 */
export interface CustomViewBlocks extends BaseViewBlocks {
	filter: SearchBlock;

	// Icons and pagination
	icons: IconsListBlock;
	pagination: PaginationBlock;
}

/**
 * Type for icons list
 */
export type IconsList = (Icon | string | null)[];

/**
 * Callback for load-* event
 */
export interface CustomViewLoadCallback {
	(icons: IconsList): void;
}

/**
 * Class
 */
export class CustomView extends BaseView {
	public readonly route: FullCustomRoute;
	protected _data: Icon[] | null = null;
	protected _blocks: CustomViewBlocks | null = null;

	// Copy of route and config variables for faster access and to make sure they do not change
	public readonly customType: string;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: FullCustomRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'custom';
		this._instance = instance;
		this.route = route;
		this.parent = parent;
		this.customType = route.params.customType;
		this._mustWaitForParent = true;
	}

	/**
	 * Start loading
	 */
	_startLoadingData(): void {
		if (this._data !== null) {
			return;
		}
		const registry = getRegistry(this._instance);
		const events = registry.events;

		// Fire public event, exposed to external code
		events.fire('load-' + this.customType, this.setIcons.bind(this));
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		switch (action) {
			// Change view
			case 'parent':
				this._parentAction(value);
				return;

			// Change provider
			case 'provider':
				this._providerAction(value);
				return;

			// Set icons
			case 'set':
				this.setIcons(value as IconsList);
				// Returning because setIcons will trigger event
				return;

			// Search icons
			case 'filter':
				if (typeof value !== 'string') {
					return;
				}
				value = value.trim().toLowerCase();
				if (value === this.route.params.filter) {
					return;
				}
				this.route.params.filter = value as string;
				this.blocksRequireUpdate = true;
				break;

			// Change current page
			case 'pagination':
				if (typeof value === 'string') {
					value = parseInt(value);
				}

				// Check number
				if (
					typeof value !== 'number' ||
					isNaN(value) ||
					value < 0 ||
					value === this.route.params.page
				) {
					return;
				}

				// Change page
				this.route.params.page = value as number;
				this.blocksRequireUpdate = true;
				break;

			default:
				return;
		}

		// Action has changed something - trigger update event
		this._triggerUpdated();
	}

	/**
	 * Render blocks
	 */
	render(): CustomViewBlocks | null {
		if (this.loading || this._blocks === null || this._data === null) {
			return null;
		}

		// Check if blocks have been cached or if there is a error
		if (!this.blocksRequireUpdate || this.error !== '') {
			return this._blocks;
		}
		this.blocksRequireUpdate = false;

		// Apply route to blocks
		const blocks = this._blocks;

		// Copy icons
		blocks.icons.icons = this._data.slice(0) as Icon[];

		// Search icons
		blocks.filter.keyword = this.route.params.filter;
		applyIconFilters(blocks.icons, blocks.filter, [], true);

		// Get items per page
		const registry = getRegistry(this._instance);
		const config = registry.config;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const itemsPerPage = config.ui!.itemsPerPage!;

		// Check pagination
		blocks.pagination.length = blocks.icons.icons.length;
		blocks.pagination.page = this.route.params.page;
		const maximumPage = maxPage(blocks.pagination);
		if (maximumPage < blocks.pagination.page) {
			this.route.params.page = blocks.pagination.page = maximumPage;
		}

		// Apply pagination
		const startIndex = blocks.pagination.page * itemsPerPage;
		blocks.icons.icons = blocks.icons.icons.slice(
			startIndex,
			startIndex + itemsPerPage
		);

		return this._blocks;
	}

	/**
	 * Set icons
	 */
	setIcons(data: IconsList): void {
		this._waitForParent(() => {
			if (!this._checkSync()) {
				// Make sure its async unless synchronous loading is enabled
				setTimeout(() => {
					this._setIcons(data);
				});
			} else {
				this._setIcons(data);
			}
		});
	}

	_setIcons(data: IconsList): void {
		// Check if data is valid
		let dataArray = data;
		let invalidData = false;
		if (!(dataArray instanceof Array)) {
			invalidData = true;
			dataArray = [];
		}

		// Filter data
		const parsedData: Icon[] = dataArray
			.map((item) => {
				// Convert strings
				if (typeof item === 'string') {
					item = stringToIcon(item);
				}

				// Validate object
				if (typeof item === 'object' && validateIcon(item)) {
					const icon = item as Icon;
					return {
						provider: icon.provider,
						prefix: icon.prefix,
						name: icon.name,
					} as Icon;
				}

				// Invalid icon
				return null;
			})
			.filter((icon) => icon !== null) as Icon[];

		// Save data
		this._data = parsedData;

		// Mark as loaded, mark blocks for re-render and reset error
		this.loading = false;
		this.blocksRequireUpdate = true;
		this.error = '';

		// Create empty blocks
		this._blocks = {
			// Search
			filter: Object.assign(defaultSearchBlock(), {
				keyword: this.route.params.filter,
				searchType: 'custom',
				title: this.customType,
			}),

			// Icons and pagination
			icons: defaultIconsListBlock(),
			pagination: defaultPaginationBlock(),
		};
		const initialisedBlocks = this._blocks;

		// Check if data was valid
		if (invalidData) {
			this.error = data === null ? 'not_found' : 'invalid_data';
			this._triggerLoaded();
			return;
		}

		// Check if there are any icons
		if (parsedData.length < 1) {
			this.error = 'empty';
		} else {
			// Get registry and modules
			const registry = getRegistry(this._instance);
			const config = registry.config;

			// Create pagination
			const pagination = initialisedBlocks.pagination;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			pagination.perPage = config.ui!.itemsPerPage!;
			pagination.fullLength = pagination.length = parsedData.length;
			pagination.page = Math.min(
				this.route.params.page,
				maxPage(pagination)
			);

			// Copy full icons list for possible use in UI
			this._blocks.icons.allIcons = parsedData;
		}

		// Send event
		this._triggerLoaded();
	}

	/**
	 * Get icons list
	 */
	getIcons(): Icon[] | null {
		if (this.loading || this._blocks === null || this._data === null) {
			return null;
		}
		return cloneObject(this._data) as Icon[];
	}
}
