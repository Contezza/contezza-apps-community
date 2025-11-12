import { Injectable } from '@angular/core';
import { WebscriptService } from '@contezza/core/services';
import { SearchParameters } from '@contezza/content-services/search/shared';
import { map, Observable } from 'rxjs';
import { ResultSetPaging } from '@alfresco/js-api';
import { toResultSet } from '../utils';
import { Task } from '../models';
import { StringUtils } from '@contezza/core/utils';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    static readonly ENDPOINT_TASK_INSTANCES = 'api/task-instances';
    static readonly ENDPOINT_TASK_FORM_PROCESSOR = 'api/task/${activitiId}/formprocessor';
    static readonly TEMPLATE_TASK_FORM_PROCESSOR = StringUtils.toTemplate(TaskService.ENDPOINT_TASK_FORM_PROCESSOR);

    constructor(private readonly webscript: WebscriptService) {}

    readTasks(parameters: SearchParameters): Observable<ResultSetPaging> {
        const { paging, currentFolder } = parameters;
        const params: string[] = [`authority=${currentFolder}`, `maxItems=${paging?.maxItems ?? 10}`, `skipCount=${paging?.skipCount ?? 0}`];

        const url = `${TaskService.ENDPOINT_TASK_INSTANCES}?${params.join('&')}`;

        return this.webscript.get(url).pipe(map(({ data }) => toResultSet(data, paging)));
    }

    readTask(taskId: string): Observable<Task> {
        return this.webscript.get<{ data: Task }>(`${TaskService.ENDPOINT_TASK_INSTANCES}/${taskId}?detailed=true`).pipe(map((response) => response.data));
    }

    updateTask(activitiId: string, body: Record<string, any>) {
        return this.webscript.put(`${TaskService.ENDPOINT_TASK_INSTANCES}/${activitiId}`, body);
    }

    processTask(activitiId: string, body: Record<string, any>) {
        return this.webscript.post(TaskService.TEMPLATE_TASK_FORM_PROCESSOR({ activitiId }), body);
    }
}
