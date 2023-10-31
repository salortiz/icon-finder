<script lang="ts">
	import Finder from '$lib/Finder.svelte'
	import type { FinderCtrl, FinderOptions, FinderCallback } from '$lib/Finder.svelte';
	const finderOpts: FinderOptions = {
		showCustomisatons: false,
		footer: 'Compact'
	};
	let finder: FinderCtrl;
	const callback: FinderCallback =
		(event) => {
			if(event.type == 'load') {
				console.log('Finder loaded!')
			}
			if(event.type == 'button') {
				if(event.button == 'cancel')
					finder.selectIcons([]);
			}
			console.log('Event:', event);
		};
</script>

<Finder bind:finder={finder} {finderOpts} {callback}/>
