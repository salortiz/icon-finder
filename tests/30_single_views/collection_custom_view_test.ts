/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { CollectionViewBlocks } from '../../lib/views/collection.js';
import { CollectionView } from '../../lib/views/collection.js';
import { Registry } from '../../lib/registry/index.js';
import type { FullCollectionRoute } from '../../lib/route/types/routes.js';
import { objectToRoute } from '../../lib/route/convert.js';
import type { PartialCollectionRouteParams } from '../../lib/route/types/params.js';
import { API as FakeAPI } from '../fake_api.js';
import type { EventCallback } from '../../lib/events.js';
import type { IconFinderCustomSets } from '../../lib/data/custom-sets.js';
import { convertCustomSets } from '../../lib/data/custom-sets.js';
import type { IconifyJSON } from '@iconify/types';
import type { CollectionInfoBlock } from '../../lib/blocks/collection-info.js';
import type { IconsListBlock } from '../../lib/blocks/icons-list.js';
import type { PaginationBlock } from '../../lib/blocks/pagination.js';

describe('Testing collection view with custom data', () => {
	const namespace = __filename;
	let nsCounter = 0;

	const prefixStart = 'collection-view-';
	let prefixCounter = 0;

	/**
	 * Get next prefix
	 */
	function nextPrefix(): string {
		return prefixStart + prefixCounter++;
	}

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = new Registry(namespace + nsCounter++);

		// Change pagination limit for tests to 48
		const config = registry.config;
		config.ui!.itemsPerPage = 48;

		// Change API to fake API
		const api = new FakeAPI(registry);
		registry.api = api;
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		iconSets: IconFinderCustomSets | IconifyJSON[],
		routeParams: PartialCollectionRouteParams,
		sync = false
	): CollectionView {
		const registry = setupRegistry();

		// Change config
		if (sync) {
			// Synchronous test
			const config = registry.config;
			config.router.syncRender = true;
		}

		// Set custom data
		registry.customIconSets = convertCustomSets(
			iconSets instanceof Array
				? {
						iconSets,
				  }
				: iconSets,
			false
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: routeParams,
			} as FullCollectionRoute) as FullCollectionRoute
		);
		view.startLoading();

		return view;
	}

	it('Custom icon set', (done) => {
		let isSync = true;
		const prefix = nextPrefix();
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// View should load asynchronously
				expect(isSync).to.be.equal(false);

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collection',
					params: {
						provider: '',
						prefix,
						filter: '',
						icon: '',
						page: 0,
						tag: null,
						themePrefix: null,
						themeSuffix: null,
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Info block
				const expectedInfo: CollectionInfoBlock = {
					type: 'collection-info',
					prefix,
					info: {
						prefix,
						name: 'Test',
						total: 1,
						version: '',
						author: {
							name: 'Unit Test',
							url: '',
						},
						license: {
							title: 'MIT',
							spdx: '',
							url: '',
						},
						samples: [],
						category: 'General',
						palette: false,
					},
				};
				expect(blocks.info).to.be.eql(expectedInfo);

				// Filters
				expect(blocks.tags).to.be.equal(null);
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				// Icons
				const expectedIcons: IconsListBlock = {
					type: 'icons-list',
					icons: [
						{
							provider: '',
							prefix,
							name: 'home',
						},
					],
					allIcons: [
						{
							provider: '',
							prefix,
							name: 'home',
						},
					],
				};
				expect(blocks.icons).to.be.eql(expectedIcons);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					page: 0,
					length: 1,
					perPage: 48,
					more: false,
					fullLength: 1,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				done();
			},
			[
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
			],
			{
				prefix,
			}
		);

		isSync = false;
	});

	it('Custom icon set (synchronous)', (done) => {
		let isSync = true;
		const prefix = nextPrefix();
		setupView(
			(data: unknown) => {
				// View should load asynchronously
				expect(isSync).to.be.equal(true);

				const view = data as CollectionView;

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collection',
					params: {
						provider: '',
						prefix,
						filter: '',
						icon: '',
						page: 0,
						tag: null,
						themePrefix: null,
						themeSuffix: null,
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Info block
				const expectedInfo: CollectionInfoBlock = {
					type: 'collection-info',
					prefix,
					info: {
						prefix,
						name: 'Test',
						total: 1,
						version: '',
						author: {
							name: 'Unit Test',
							url: '',
						},
						license: {
							title: 'MIT',
							spdx: '',
							url: '',
						},
						samples: [],
						category: 'General',
						palette: false,
					},
				};
				expect(blocks.info).to.be.eql(expectedInfo);

				// Filters
				expect(blocks.tags).to.be.equal(null);
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				// Icons
				const expectedIcons: IconsListBlock = {
					type: 'icons-list',
					icons: [
						{
							provider: '',
							prefix,
							name: 'home',
						},
					],
					allIcons: [
						{
							provider: '',
							prefix,
							name: 'home',
						},
					],
				};
				expect(blocks.icons).to.be.eql(expectedIcons);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					page: 0,
					length: 1,
					perPage: 48,
					more: false,
					fullLength: 1,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				done();
			},
			[
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
			],
			{
				prefix,
			},
			true
		);

		isSync = false;
	});

	it('Custom icon set with categories', (done) => {
		const prefix = nextPrefix();
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				expect(blocks.tags).to.not.be.equal(null);

				// Filters
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				done();
			},
			[
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix,
					icons: {
						home: {
							body: '<g />',
						},
						account: {
							body: '<g />',
						},
					},
					categories: {
						Test1: ['home'],
						Test2: ['account'],
					},
				},
			],
			{
				prefix,
			}
		);
	});
});
