import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@alfresco/adf-core';
import { Group } from '@alfresco/js-api';

@Pipe({ name: 'displayName', standalone: true })
export class DisplayNamePipe implements PipeTransform {
    transform(model: Group | Pick<User, 'displayName' | 'firstName' | 'lastName'>): string {
        if (model) {
            const displayName = 'id' in model ? model.displayName : `${model.firstName || ''} ${model.lastName || ''}`;
            return displayName.trim();
        }
        return '';
    }
}
