export interface FacetSelection {
    label: string;
    order?: number;
    icon?: string;
    svgIcon?: string;
    iconMap?(value: string): string;
    svgIconMap?(value: string): string;
}
