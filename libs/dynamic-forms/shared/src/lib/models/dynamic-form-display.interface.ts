export interface ContezzaDynamicFormDisplay {
    readonly value?: ContezzaSimpleDisplay;
    readonly option?: ContezzaSimpleDisplay;
}

export interface ContezzaSimpleDisplay {
    readonly icon?: string;
    readonly label?: string;
    readonly placeholder?: string;
    readonly tooltip?: string;
    readonly html?: string;
    readonly component?: string;
}
