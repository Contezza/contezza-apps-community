import { Stylable } from '@contezza/core/utils';

export interface SharedThumbnailData extends Stylable {
    tooltip?: string;
}

/**
 * The data used by {@link ThumbnailColumnComponent} to display a thumbnail.
 */
export interface ThumbnailData extends SharedThumbnailData {
    icon: string;
    badge?: string;
}
