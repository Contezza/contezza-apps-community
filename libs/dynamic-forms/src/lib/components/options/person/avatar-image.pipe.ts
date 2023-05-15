import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from '@alfresco/adf-core';
import { ContentService } from '@alfresco/adf-content-services';

@Pipe({ name: 'avatarImage' })
export class AvatarImagePipe implements PipeTransform {
    constructor(private readonly auth: AuthenticationService, private readonly contentService: ContentService) {}

    transform(avatar: string): string {
        return avatar ? this.contentService.getContentUrl(avatar.split('/')[4], false, this.auth.getTicketEcm()) : undefined;
    }
}
