import { Pipe, PipeTransform } from '@angular/core';
import { AlfrescoApiService, ContentService } from '@alfresco/adf-content-services';

@Pipe({ standalone: false, name: 'avatarImage' })
export class AvatarImagePipe implements PipeTransform {
    constructor(private readonly alfrescoApi: AlfrescoApiService, private readonly contentService: ContentService) {}

    transform(avatar: string): string {
        return avatar ? this.contentService.getContentUrl(avatar.split('/')[4], false, this.alfrescoApi.getInstance().getTicketEcm()) : undefined;
    }
}
