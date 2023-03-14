import { Pipe, PipeTransform } from '@angular/core';

import { AuthenticationService, ContentService } from '@alfresco/adf-core';

@Pipe({ name: 'avatarImage', standalone: true })
export class AvatarImagePipe implements PipeTransform {
    constructor(private readonly auth: AuthenticationService, private readonly contentService: ContentService) {}

    transform(avatar: string): string {
        return avatar ? this.contentService.getContentUrl(avatar.split('/')[4], false, this.auth.getTicketEcm()) : '';
    }
}
