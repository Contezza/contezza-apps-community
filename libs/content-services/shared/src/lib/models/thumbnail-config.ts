export interface ThumbnailConfig {
    /**
     * If defined then the badge-resolution logic is triggered,
     * based on a match between this value and the `id` of a {@link ThumbnailBadgeResolver} registered in {@link ThumbnailService}.
     */
    badge?: string;
    /**
     * If `true` then the thumbnail is replaced by a selection icon when the corresponding item is selected.
     */
    withSelection?: boolean;
}
