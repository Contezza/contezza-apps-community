import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@alfresco/adf-core';

@Pipe({ name: 'userFullName', standalone: true })
export class UserFullNamePipe implements PipeTransform {
    transform(user?: Pick<User, 'firstName' | 'lastName'>): string {
        return user ? `${user.firstName} ${user.lastName}` : '';
    }
}
