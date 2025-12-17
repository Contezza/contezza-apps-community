import { createAction, props } from '@ngrx/store';
import { Task } from '../models';
import { NodeEntry } from '@alfresco/js-api';

export enum ProcessActionType {
    NavigateToTask = '[PROCESS_SERVICES] NAVIGATE_TO_TASK',
    Save = '[PROCESS_SERVICES] SAVE',
    Claim = '[PROCESS_SERVICES] CLAIM',
    Release = '[PROCESS_SERVICES] RELEASE',
    Complete = '[PROCESS_SERVICES] COMPLETE',
    Approve = '[PROCESS_SERVICES] APPROVE',
    Reject = '[PROCESS_SERVICES] REJECT',
}

interface TaskPayload {
    task: Task;
    comment?: string;
}

export const navigateToTask = createAction(ProcessActionType.NavigateToTask, props<{ payload: NodeEntry }>());
export const save = createAction(ProcessActionType.Save, props<{ payload: TaskPayload }>());
export const claim = createAction(ProcessActionType.Claim);
export const release = createAction(ProcessActionType.Release);
export const complete = createAction(ProcessActionType.Complete, props<{ payload: TaskPayload }>());
export const approve = createAction(ProcessActionType.Approve, props<{ payload: TaskPayload }>());
export const reject = createAction(ProcessActionType.Reject, props<{ payload: TaskPayload }>());
