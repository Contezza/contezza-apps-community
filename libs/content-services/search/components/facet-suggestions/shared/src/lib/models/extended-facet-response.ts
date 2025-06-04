import { GenericBucket } from '@alfresco/js-api';

export interface ExtendedFacetResponse {
    type?: string;
    label?: string;
    buckets?: ExtendedBucket[];
}

export interface ExtendedBucket extends GenericBucket {
    icon?: string;
    svgIcon?: string;
}
