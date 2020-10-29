/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import type { CollectionsViewBlocks } from '../../lib/views/collections';
import { CollectionsView } from '../../lib/views/collections';
import { getCollectionsBlockPrefixes } from '../../lib/blocks/collections-list';
import { Registry } from '../../lib/registry';
import type { FullCollectionsRoute } from '../../lib/route/types/routes';
import { objectToRoute } from '../../lib/route/convert';
import type { FullCollectionsRouteParams } from '../../lib/route/types/params';
import type { EventCallback } from '../../lib/events';
import { API as FakeAPI } from '../fake_api';

describe('Testing collections list view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(provider = ''): Registry {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(provider, '/collections', {}, 'collections');
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		routeParams: FullCollectionsRouteParams = {
			provider: '',
			filter: '',
			category: null,
		}
	): CollectionsView {
		const registry = setupRegistry(routeParams.provider);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
				params: routeParams,
			}) as FullCollectionsRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Do tests
	 */
	it('Creating view', (done) => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as CollectionsView;

			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'collections',
			params: {
				provider: '',
				filter: '',
				category: null,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', (done) => {
		const view = setupView((data: unknown) => {
			expect(data).to.be.equal(view);
			expect(view.route).to.be.eql({
				type: 'collections',
				params: {
					provider: '',
					filter: '',
					category: null,
				},
				parent: null,
			});
			done();
		});
	});

	it('Test custom provider', (done) => {
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: 'test',
						filter: '',
						category: null,
					},
					parent: null,
				});
				done();
			},
			{
				provider: 'test',
				filter: '',
				category: null,
			}
		);
	});

	it('Provider mismatch', (done) => {
		// Load fixture only for 'test' provider
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, null);
		api.loadFixture('test', '/collections', {}, 'collections');

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});

	it('Test not found error', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, null);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});

	it('Test rendering blocks', (done) => {
		const view = setupView(() => {
			const blocks = view.render() as NonNullable<CollectionsViewBlocks>;
			expect(blocks).to.not.be.equal(null);

			// Test categories block
			const categories = Object.keys(blocks.categories.filters);
			expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
			categories.forEach((category) => {
				expect(
					blocks.categories.filters[category].disabled
				).to.be.equal(false);
			});
			expect(blocks.categories.active).to.be.equal(null);

			// Collections block was tested in applyCollectionsFilter() test

			// Test filter block
			expect(blocks.filter.keyword).to.be.equal('');

			done();
		});
	});

	it('Test filter', (done) => {
		const view = setupView(
			() => {
				let blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach((category) => {
					// Everything except 'General' should be disabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(category !== 'General');
				});
				expect(blocks.categories.active).to.be.equal(null);

				// Check collections
				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql(['mdi', 'mdi-light', 'zmdi']);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('mdi');

				/**
				 * Apply new filter by icon height
				 */
				view.route.params.filter = '20';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionsViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql([
					'dashicons',
					'entypo',
					'foundation',
					'iwwa',
					'entypo-social',
				]);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('20');

				categories.forEach((category) => {
					// Everything except 'Emoji' should be enabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(category === 'Emoji');
				});
				expect(blocks.categories.active).to.be.equal(null);

				done();
			},
			{
				provider: '',
				filter: 'mdi',
				category: null,
			}
		);
	});

	it('Test collections', (done) => {
		const view = setupView(
			() => {
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach((category) => {
					// Everything should be enabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(false);
				});
				expect(blocks.categories.active).to.be.equal('Thematic');

				// Check collections
				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql(['fa-brands', 'cryptocurrency', 'medical-icon']);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('32');

				done();
			},
			{
				provider: '',
				filter: '32',
				category: 'Thematic',
			}
		);
	});

	/**
	 * Bad data
	 */
	it('Bad data (object)', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData(
			'',
			'/collections',
			{},
			JSON.stringify({
				error: 'not_found',
			})
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.loading).to.be.equal(false);
			expect(view.error).to.be.equal('empty');
			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});

	it('Bad data (string)', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, 'whatever');

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.loading).to.be.equal(false);
			expect(view.error).to.be.equal('empty');
			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});
});
