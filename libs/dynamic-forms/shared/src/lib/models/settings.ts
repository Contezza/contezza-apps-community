/**
 * Generic dynamic-form settings.
 */
export interface Settings {
    /**
     * Defines how much idle time (in ms) must pass before a user typing operation can be considered over and further processed.
     * Used as parameter for `rxjs/operators/debounce` or `debounceTime`.
     */
    typingDebounceTime: number;
}
