import { createAction } from './models';

export enum ActionType {
    MAIL = 'mail',
    // Without a second enum value is the ActionType of publishErrorQueueMessage inferred as ActionType and not as ActionType.PUBLISH_ERROR_QUEUE_MESSAGE. Remove _PLACEHOLDER when a second action is implemented.
    _PLACEHOLDER = '_PLACEHOLDER',
}

export const mailAction = createAction(ActionType.MAIL)<{ from: string; to: string; subject: string; text: string }>();
