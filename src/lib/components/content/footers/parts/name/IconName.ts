/* Various components for icon name. */
import SimpleName from './Simple.svelte';
import EditableName from './SimpleEditable.svelte';
import BlockName from './Block.svelte';

export const IconNameMap = {
	'Simple': SimpleName,
	'Editable': EditableName,
	'Block': BlockName,
}
export type IconNames = keyof typeof IconNameMap;
