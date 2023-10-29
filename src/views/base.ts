import type { APIParams } from '../api/base.js';
import { getRegistry } from '../registry/storage.js';
import { getProvider } from '../data/providers.js';

/**
 * View error
 *
 * Errors:
 * 	'' - none
 * 	'timeout' - API call timed out
 * 	'invalid_data' - invalid data was sent from API
 * 	'empty' - view is empty (after parsing API response, before applying route filters)
 *  'not_found' - API returned "not found" error
 */
export type ViewError = '' | 'timeout' | 'invalid_data' | 'empty' | 'not_found';

/**
 * Blocks
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseViewBlocks {}

/**
 * Base view class
 */
export class BaseView {
	protected _instance!: string;
	public type = '';
	public parent: BaseView | null = null;
	public updating = false;
	public error: ViewError = '';
	public blocksRequireUpdate = true;

	// Loading status
	public loading = true;
	protected _loadingTimer: unknown = null;
	protected _alreadyLoaded = false;
	protected _startedLoading = false;

	// Loading control: waiting for parent view
	public onLoad: (() => void) | null = null;
	protected _mustWaitForParent = false;
	protected _isSync: boolean | null = null;

	/**
	 * Set _isSync variable
	 */
	_checkSync(): boolean {
		if (this._isSync === null) {
			this._isSync = !!getRegistry(this._instance).config.router
				.syncRender;
		}
		return this._isSync;
	}

	/**
	 * Change parent view
	 */
	_parentAction(value: unknown): void {
		if (this.parent === null) {
			return;
		}

		const levels = typeof value === 'number' && value > 0 ? value : 1;
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.setParentView(levels);
	}

	/**
	 * Change provider
	 */
	_providerAction(value: unknown): void {
		if (typeof value !== 'string') {
			return;
		}
		const providerData = getProvider(value);
		if (!providerData) {
			return;
		}
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.home(value);
	}

	/**
	 * Start loading
	 */
	startLoading(): void {
		if (this._startedLoading) {
			return;
		}

		// Already loaded somehow (by setting data directly)
		if (!this.loading) {
			this._startedLoading = true;
			return;
		}

		// Start loading
		if (this._mustWaitForParent && this.parent !== null) {
			this.parent.startLoading();
		}
		this._startLoading();
	}

	/**
	 * Start loading
	 */
	_startLoading(): void {
		this._startedLoading = true;

		if (this._checkSync()) {
			this._startLoadingData();
		} else {
			setTimeout(() => {
				this._startLoadingData();
			});
		}
	}

	_startLoadingData(): void {
		throw new Error('startLoading should not be called on base view');
	}

	/**
	 * Search action
	 */
	_searchAction(provider: string, value: unknown): void {
		if (typeof value !== 'string' || value.trim() === '') {
			return;
		}

		const keyword = (value as string).trim().toLowerCase();

		// Check for collections
		let view = this as BaseView;
		let levels = 0;
		while (view.type !== 'collections') {
			if (view.parent === null) {
				return;
			}
			view = view.parent;
			levels++;
		}

		// Apply action to collections
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.createChildView(
			{
				type: 'search',
				params: {
					provider,
					search: keyword,
				},
			},
			levels
		);
	}

	/**
	 * Load data from API
	 */
	_loadAPI(
		provider: string,
		query: string,
		params: APIParams,
		cacheKey: string | boolean = true
	): void {
		const registry = getRegistry(this._instance);
		const api = registry.api;

		// Send query
		api.query(
			provider,
			query,
			params,
			(data, error) => {
				if (data === void 0) {
					// Error
					if (this.loading) {
						this.error = error === 404 ? 'not_found' : 'timeout';
						this.loading = false;
						this._triggerLoaded();
					}
					return;
				}

				if (data === null || !this._mustWaitForParent) {
					// Parse immediately
					this._parseAPIData(data);
					return;
				}

				// Parse data after parent view has finished loading
				this._waitForParent(() => {
					this._parseAPIData(data);
				});
			},
			cacheKey
		);
	}

	/**
	 * Wait for parent view to load
	 */
	_waitForParent(callback: () => void): void {
		if (
			!this._mustWaitForParent ||
			this.parent === null ||
			!this.parent.loading
		) {
			callback();
			return;
		}

		// Wait for parent
		this.parent.onLoad = callback;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_parseAPIData(data: unknown): void {
		throw new Error('_parseAPIData should not be called on base view');
	}

	/**
	 * Send event when view has been loaded
	 *
	 * Can be sent synchronously
	 */
	_triggerLoaded(): void {
		if (this._alreadyLoaded) {
			// Do not trigger event twice
			this._triggerUpdated();
			return;
		}
		this._alreadyLoaded = true;

		const registry = getRegistry(this._instance);
		const events = registry.events;
		events.fire('view-loaded', this);

		// Trigger onLoad event for child view
		if (this.onLoad !== null) {
			const onLoad = this.onLoad;
			this.onLoad = null;
			onLoad();
		}
	}

	/**
	 * Send event when view has been updated
	 *
	 * Must be sent asynchronously to consume multiple updates
	 */
	_triggerUpdated(): void {
		if (!this.updating) {
			this.updating = true;
			const update = () => {
				this.updating = false;
				const registry = getRegistry(this._instance);
				const events = registry.events;
				events.fire('view-updated', this);
			};
			if (this._checkSync()) {
				update();
			} else {
				setTimeout(update);
			}
		}
	}
}
