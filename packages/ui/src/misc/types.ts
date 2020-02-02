/**
 * UI Event
 */
export type UIEvent = 'selection';
export interface UICallback {
	(event: UIEvent, payload: any): void;
}

/**
 * Internal event
 */
export type InternalEvent = 'selection';
export interface InternalCallback {
	(event: InternalEvent, payload: any): void;
}

/**
 * This should never be called
 */
export function assertNever(value: never): void {
	// Do nothing
}
