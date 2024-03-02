/* Various components for icon name. */
import SimpleName from './Simple.svelte';
import EditableName from './SimpleEditable.svelte';
import BlockName from './Block.svelte';
import AliasName from './SimpleAlias.svelte';

export const IconNameMap = {
	'Simple': SimpleName,
	'Editable': EditableName,
	'Alias': AliasName,
	'Block': BlockName,
}
export type IconNames = keyof typeof IconNameMap;
