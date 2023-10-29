import type { CollectionsView, CollectionsViewBlocks } from './collections.js';
import type { CollectionView, CollectionViewBlocks } from './collection.js';
import type { SearchView, SearchViewBlocks } from './search.js';
import type { CustomView, CustomViewBlocks } from './custom.js';
import type { EmptyView, EmptyViewBlocks } from './empty.js';

export type View =
	| CollectionsView
	| CollectionView
	| SearchView
	| CustomView
	| EmptyView;
export type ViewBlocks =
	| CollectionsViewBlocks
	| CollectionViewBlocks
	| SearchViewBlocks
	| CustomViewBlocks
	| EmptyViewBlocks;
