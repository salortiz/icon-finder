/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { CollectionViewBlocks } from '../../lib/views/collection';
import { CollectionView } from '../../lib/views/collection';
import { Registry } from '../../lib/registry';
import type { FullCollectionRoute } from '../../lib/route/types/routes';
import { objectToRoute, objectToRouteParams } from '../../lib/route/convert';
import type {
	FullCollectionRouteParams,
	PartialCollectionRouteParams,
} from '../../lib/route/types/params';
import { API as FakeAPI } from '../fake_api';
import type { EventCallback } from '../../lib/events';
import type { FiltersBlock } from '../../lib/blocks/filters';
import { isFiltersBlockEmpty } from '../../lib/blocks/filters';
import type { Icon } from '../../lib/icon';
import type { IconsListBlock } from '../../lib/blocks/icons-list';
import { isSearchBlockEmpty } from '../../lib/blocks/search';
import type { PaginationBlock } from '../../lib/blocks/pagination';

describe('Testing collection view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(prefix: string): Registry {
		const registry = new Registry(namespace + nsCounter++);

		// Change pagination limit for tests to 48
		const config = registry.config;
		config.ui!.itemsPerPage = 48;

		// Change API to fake API and load fixture
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			'',
			'/collection',
			{
				prefix: prefix,
				info: 'true',
				chars: 'true',
				aliases: 'true',
			},
			prefix
		);
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		prefix: string,
		routeParams: PartialCollectionRouteParams | null = null
	): CollectionView {
		const registry = setupRegistry(prefix);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Merge params
		const params = objectToRouteParams(
			'collection',
			Object.assign({}, routeParams === null ? {} : routeParams, {
				prefix: prefix,
			})
		) as FullCollectionRouteParams;

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: params,
			}) as FullCollectionRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Get icon names from block
	 */
	function getIconNames(block: IconsListBlock): string[] {
		return (block.icons as Icon[]).map((icon) => {
			return icon.name;
		});
	}

	/**
	 * Filter tags
	 */
	function filterTags(block: FiltersBlock, disabled: boolean): string[] {
		return Object.keys(block.filters).filter(
			(key) => block.filters[key].disabled === disabled
		);
	}

	/**
	 * Do tests
	 */
	it('Creating view', (done) => {
		const registry = setupRegistry('fa-regular');

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as CollectionView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: {
					prefix: 'fa-regular',
				},
			}) as FullCollectionRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'collection',
			params: {
				provider: '',
				prefix: 'fa-regular',
				filter: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', (done) => {
		const view = setupView((data: unknown) => {
			expect(data).to.be.equal(view);
			done();
		}, 'fa-regular');
	});

	it('Not found', (done) => {
		const prefix = 'foo';
		const registry = new Registry(namespace + nsCounter++);

		// Change API to fake API and emulate "not found" response
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData(
			'',
			'/collection',
			{
				prefix,
				info: 'true',
				chars: 'true',
				aliases: 'true',
			},
			null
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionView;

			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: {
					prefix: prefix,
				},
			}) as FullCollectionRoute
		);
		view.startLoading();
	});

	it('Test fa-regular ()', (done) => {
		const view = setupView(
			() => {
				let iconNames: string[];
				let tags: FiltersBlock;
				let tagsList: string[];
				let expectedPagination: PaginationBlock;

				// Check view
				expect(view.prefix).to.be.equal('fa-regular');
				expect(view.error).to.be.equal('');

				let blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');
				expect(isSearchBlockEmpty(blocks.filter)).to.be.equal(true);

				// Themes should not be set
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.themePrefixes)).to.be.equal(
					true
				);
				expect(blocks.themeSuffixes).to.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.themeSuffixes)).to.be.equal(
					true
				);

				// Tags
				expect(blocks.tags).to.not.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.tags)).to.be.equal(false);

				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal(null);
				expect(tags.filterType).to.be.equal('tags');
				expect(Object.keys(tags.filters)).to.be.eql([
					'Accessibility',
					'Alert',
					'Arrows',
					'Audio & Video',
					'Buildings',
					'Business',
					'Camping',
					'Charity',
					'Chat',
					'Code',
					'Communication',
					'Computers',
					'Currency',
					'Date & Time',
					'Design',
					'Editors',
					'Education',
					'Emoji',
					'Energy',
					'Files',
					'Finance',
					'Fitness',
					'Food',
					'Fruits & Vegetables',
					'Games',
					'Hands',
					'Health',
					'Hotel',
					'Images',
					'Interfaces',
					'Maps',
					'Maritime',
					'Marketing',
					'Medical',
					'Music',
					'Objects',
					'Payments & Shopping',
					'Political',
					'Science Fiction',
					'Security',
					'Shapes',
					'Social',
					'Spinners',
					'Sports',
					'Status',
					'Summer',
					'Toggle',
					'Travel',
					'Users & People',
					'Vehicles',
					'Weather',
					'Writing',
				]);

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Pagination
				expectedPagination = {
					type: 'pagination',
					length: 151,
					fullLength: 151,
					more: false,
					page: 3,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Icons
				expect(blocks.icons.icons.length).to.be.equal(7); // 151 - 48 * 3

				// Check for window-minimize
				expect(
					blocks.icons.icons.filter(
						(icon: Icon) => icon.name === 'window-minimize'
					).length
				).to.be.equal(1);

				/**
				 * Apply category filter
				 */
				view.route.params.tag = 'Weather';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Check tags filter
				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal('Weather');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Check pagination
				expect(view.route.params.page).to.be.equal(0);
				expectedPagination = {
					type: 'pagination',
					length: 3,
					fullLength: 151,
					more: false,
					page: 0,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Check icons
				expect(blocks.icons.icons.length).to.be.equal(3);
				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['moon', 'snowflake', 'sun']);

				/**
				 * Reset tag filter, apply keyword filter
				 */
				view.route.params.tag = null;
				view.route.params.filter = 'cal';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Check pagination
				expectedPagination = {
					type: 'pagination',
					length: 6,
					fullLength: 151,
					more: false,
					page: 0,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Check icons
				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql([
					'calendar',
					'calendar-alt',
					'calendar-check',
					'calendar-minus',
					'calendar-plus',
					'calendar-times',
				]);

				// Check tags
				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal(null);
				expect(tags.filterType).to.be.equal('tags');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.not.be.eql([]);

				// Check for enabled tags
				tagsList = filterTags(tags, false);
				expect(tagsList).to.be.eql([
					'Business',
					'Date & Time',
					'Interfaces',
					'Objects',
					'Shapes',
					'Status',
				]);

				done();
			},
			'fa-regular',
			{
				prefix: 'fa-regular',
				page: 3,
			}
		);
	});

	it('Test mdi (uncategorised)', (done) => {
		const view = setupView(
			() => {
				let tagsList: string[];

				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');

				// Themes should not be set
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				// Tags
				expect(blocks.tags).to.not.be.equal(null);

				const tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal('');
				expect(tags.filterType).to.be.equal('tags');
				tagsList = Object.keys(tags.filters);
				expect(tagsList.length).to.be.equal(62);

				// Last tag should be '' = uncategorised
				expect(tagsList.pop()).to.be.equal('');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 1896,
					fullLength: 5855,
					more: false,
					page: 0,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				done();
			},
			'mdi',
			{
				prefix: 'mdi',
				tag: '',
			}
		);
	});

	it('Test mdi (filter alias)', (done) => {
		const view = setupView(
			() => {
				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('about');

				// Themes should not be set
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				// Tags
				expect(blocks.tags).to.not.be.equal(null);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 3,
					fullLength: 5855,
					more: false,
					page: 0,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Icons list
				expect(blocks.icons.icons.length).to.be.equal(
					blocks.pagination.length
				);

				// Check for first icon, should be 'mdi:information'
				const expectedIcon: Icon = {
					provider: '',
					prefix: 'mdi',
					name: 'information',
					tags: [''],
					aliases: [
						'about',
						'about-circle',
						'info-circle',
						'information-circle',
					],
				};
				expect(blocks.icons.icons[0]).to.be.eql(expectedIcon);

				done();
			},
			'mdi',
			{
				prefix: 'mdi',
				// Icons with 'about' in name do not exist, but few aliases do exist
				filter: 'about',
			}
		);
	});

	it('Test ant-design (filter by suffix)', (done) => {
		const view = setupView(
			() => {
				let suffixesList: string[];

				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');

				// Tags and prefixes should not be set
				expect(blocks.tags).to.be.equal(null);
				expect(blocks.themePrefixes).to.be.equal(null);

				// Suffixes
				expect(blocks.themeSuffixes).to.not.be.equal(null);

				const suffixes = blocks.themeSuffixes as FiltersBlock;
				expect(suffixes.active).to.be.equal('Outline');
				expect(suffixes.filterType).to.be.equal('themeSuffixes');
				suffixesList = Object.keys(suffixes.filters);
				expect(suffixesList).to.be.eql(['Fill', 'Outline', 'TwoTone']);

				// Check for disabled suffixes
				suffixesList = filterTags(suffixes, true);
				expect(suffixesList).to.be.eql([]);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 366,
					fullLength: 728,
					more: false,
					page: 3,
					perPage: 48,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Check icons block for "git*" icons
				const iconNames = getIconNames(blocks.icons).filter(
					(name) => name.slice(0, 3) === 'git'
				);
				expect(iconNames).to.be.eql([
					'github-outline',
					'gitlab-outline',
				]);

				done();
			},
			'ant-design',
			{
				prefix: 'ant-design',
				themeSuffix: 'Outline',
				page: 3,
			}
		);
	});
});