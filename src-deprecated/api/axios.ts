import type { APISendQueryCallback } from '@iconify/search-core/lib/api/base';
import { BaseAPI } from '@iconify/search-core/lib/api/base';
import type { RedundancyPendingItem } from '@cyberalien/redundancy';
import axios from 'axios';

/**
 * API class
 */
export class API extends BaseAPI {
	/**
	 * Send API query without provider
	 *
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param callback Callback
	 */
	sendQuery(
		host: string,
		params: string,
		callback: APISendQueryCallback
	): void {
		const instance = axios.create({
			baseURL: host,
		});
		instance
			.get(params)
			.then((response) => {
				if (response.status === 404) {
					// Not found. Should be called in error handler
					callback('not_found', null);
					return;
				}

				if (response.status !== 200) {
					callback('error', null);
					return;
				}

				// Copy data. No need to parse it, axios parses JSON data
				const data = response.data;
				if (typeof data !== 'object' || data === null) {
					callback('error', null);
					return;
				}

				// Store cache and complete
				callback('success', data);
			})
			.catch((err) => {
				if (
					typeof err === 'object' &&
					err.response &&
					err.response.status &&
					err.response.status === 404
				) {
					// Not found
					callback('not_found', null);
				} else {
					callback('error', null);
				}
			});
	}

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param provider Provider string
	 * @param cacheKey API cache key, null if data should not be cached
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param status Query status
	 */
	_query(
		provider: string,
		cacheKey: string | null,
		host: string,
		params: string,
		status: RedundancyPendingItem
	): void {
		// console.log('API request: ' + host + params);
		this.sendQuery(host, params, (response, data) => {
			switch (response) {
				case 'success':
				case 'not_found':
					if (cacheKey !== null) {
						this.storeCache(provider, cacheKey, data);
					}
					status.done(data);
			}
		});
	}
}
