export interface Notification {
    message: string | { label: string; params?: any };
    status: NotificationStatus;
}

export enum NotificationStatus {
    PROGRESS = 'progress',
    COMPLETE = 'complete',
}
