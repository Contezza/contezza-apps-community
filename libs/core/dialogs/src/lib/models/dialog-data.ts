export interface DialogTitle {
    label: string;
    params?: any;
    tooltip?: string;
}

export interface DialogData {
    title: string | DialogTitle;
    buttons: DialogButtons;
}

export interface DialogButtons {
    cancel: string;
    submit: string;
}
