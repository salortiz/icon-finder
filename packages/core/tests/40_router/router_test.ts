/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import { createRegistry, Registry } from '../../lib/registry';
import { CollectionRoute, PartialRoute } from '../../lib/route/types';
import { API as FakeAPI } from '../fake_api';
import { RouterEvent } from '../../lib/route/router';

describe('Testing router', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = createRegistry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture('/collections', {}, 'collections');
		return registry;
	}

	/**
	 * Do tests
	 */
	it('Creating router, navigating to home', done => {
		const registry = setupRegistry();
		const events = registry.events;

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// First load - loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load - home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('Loading route from object', done => {
		const registry = setupRegistry();
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: 'mdi',
			},
			'mdi'
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		router.subscribe(params => {
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// First load - loading page
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load - home page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.route = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		} as CollectionRoute;
	});

	it('Creating child view', done => {
		const registry = setupRegistry();
		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: 'mdi',
			},
			'mdi'
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change view to "mdi"
					router.createChildView({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					} as PartialRoute);
					break;

				case 3:
					// "mdi" has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('Creating child view with delay, testing parent view', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: 'mdi',
			},
			'mdi',
			{
				responseDelay: 200,
			}
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change view to "mdi"
					router.createChildView({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					} as PartialRoute);
					break;

				case 3:
					// "mdi" is pending
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 4:
					// "mdi" has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change to parent view
					router.setParentView(1);
					break;

				case 5:
					// Page was changed to collections
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('Child view loading faster than parent view, no delay', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture('/collections', {}, 'collections', {
			responseDelay: 500,
		});
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: 'mdi',
			},
			'mdi',
			{
				responseDelay: 10,
			}
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// MDI page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Navigate to parent page
					router.setParentView();
					break;

				case 3:
					// Home page, loading. MDI view should not have waited for home page to load
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');

					break;

				case 4:
					// Home page, loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to mdi
		router.route = {
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
			parent: {
				type: 'collections',
			},
		} as PartialRoute;
	});

	it('Child view loading faster than parent view, with delay', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;
		config.data.display.itemsPerPage = 32;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home',
			{
				responseDelay: 300,
			}
		);
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: 'mdi',
			},
			'mdi',
			{
				responseDelay: 10,
			}
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// MDI page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Navigate to parent page
					router.setParentView();
					break;

				case 3:
					// Search results, should have been loaded because MDI should have waited for search results
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to search -> mdi
		router.route = {
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
			parent: {
				type: 'search',
				params: {
					search: 'home',
					short: true,
				},
			},
		} as PartialRoute;
	});

	it('Creating sibling view', done => {
		const registry = setupRegistry();
		const events = registry.events;

		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
		);
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 999,
			},
			'search-home-full'
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Search results have loaded
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change page
					router.createChildView(
						{
							type: 'search',
							params: {
								search: 'home',
								page: 2,
								short: false,
							},
						},
						1
					);
					break;

				case 3:
					// Full results
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							page: 2,
							short: false,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to search results
		router.route = ({
			type: 'search',
			params: {
				search: 'home',
				page: 1,
				short: true,
			},
			parent: {
				type: 'collections',
			},
		} as unknown) as PartialRoute;
	});
});
