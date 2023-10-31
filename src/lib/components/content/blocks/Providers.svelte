<script lang="ts">
	import { getContext } from 'svelte';
	import { getProvider } from '@iconify/search-core';
	import type { WrappedRegistry } from '$lib/wrapper/registry.js';
	import { phrases } from '$lib/config/phrases.js';
	import Tabs from '../../ui/Tabs.svelte';
	import Block from '../Block.svelte';
	import AddForm from '../../ui/AddForm.svelte';
	import {
		validateProvider,
		retrieveProvider,
	} from '$lib/provider/add-provider.js';
	import type { APIProviderError } from '$lib/provider/add-provider.js';
	import type { Tab } from '../../types.js';

	// Route
	// export let route: FullRoute;

	// Active provider
	export let activeProvider: string;

	// Available providers
	export let providers: string[];

	// Registry
	const registry = getContext('registry') as WrappedRegistry;
	const { canAddProviders } = registry.config.finder;
	const providersPhrases = phrases.providers;

	let formVisible: boolean = false;
	let status = '';

	/**
	 * Select new provider
	 */
	function handleClick(key: string) {
		formVisible = false;
		registry.router.action('provider', key);
	}

	/**
	 * Toggle form
	 */
	function toggleForm() {
		formVisible = !formVisible;
	}

	/**
	 * Validate possible new provider
	 */
	function validateForm(value: string) {
		if (status !== '') {
			// Reset status on input change
			status = '';
		}
		return validateProvider(value) !== null;
	}

	/**
	 * Submit new provider
	 */
	function submitForm(value: string) {
		const host = validateProvider(value);
		if (!host) {
			return;
		}
		status = providersPhrases.status.loading.replace('{host}', host);
		retrieveProvider(registry, host, (host, success, provider) => {
			if (!success) {
				const error = provider as APIProviderError;
				// Use provider as error message
				status = providersPhrases.status[error].replace('{host}', host);
				return;
			}

			status = '';
			formVisible = false;
			registry.router.action('provider', provider);
		});
	}

	// Get items
	let list: Tab[];
	$: {
		list = [];
		providers.forEach((provider, index) => {
			const item = getProvider(provider);
			if (item) {
				list.push({
					key: provider,
					title: item.title,
					index,
				});
			}
		});

		if (canAddProviders) {
			list.push({
				key: 'add',
				title: '',
				hint: providersPhrases.add,
				onClick: toggleForm,
				right: true,
				index: 0,
				type: 'icon',
				icon: formVisible ? 'reset' : 'plus',
			});
		}
	}
</script>

<Block type="providers">
	<Tabs tabs={list} selected={activeProvider} onClick={handleClick} />
	{#if formVisible}
		<AddForm
			phrases={providersPhrases.addForm}
			inputIcon="link"
			buttonIcon={true}
			value=""
			onValidate={validateForm}
			onSubmit={submitForm}
			{status} />
	{/if}
</Block>
