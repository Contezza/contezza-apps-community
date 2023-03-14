export enum Step {
    Select,
    Fill,
}

export interface Settings {
    steps: Step[];
    stepIndex?: number;
}
