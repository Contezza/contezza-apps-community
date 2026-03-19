import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { TranslatePipe } from '@ngx-translate/core';

import { concatMap, delay, from, map, Observable, take, throwError } from 'rxjs';

import { EcmUserModel, PeopleContentService } from '@alfresco/adf-content-services';
import { CORE_PIPES, UploadDirective } from '@alfresco/adf-core';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatExpansionModule, MatFormFieldModule, TranslatePipe, CORE_PIPES, UploadDirective, MatInput],
    selector: 'contezza-profile-user-form',
    templateUrl: 'user-form.component.html',
    styleUrls: ['user-form.component.scss'],
    host: { class: 'contezza-profile-user-form' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
    // constructor
    private readonly ecmUserService = inject(PeopleContentService);

    ecmUser$: Observable<EcmUserModel> = this.getEcmUserInfo();
    disabledFields: Array<string> = ['firstName', 'lastName', 'email', 'companyName'];

    generalFormDisabled = true;
    companyFormDisabled = true;

    readonly generalForm = new FormGroup({
        firstName: new FormControl({ value: '', disabled: true }, [Validators.required]),
        lastName: new FormControl({ value: '', disabled: true }, [Validators.required]),
        status: new FormControl({ value: '', disabled: true }),
        description: new FormControl({ value: '', disabled: true }),
        email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
        mobile: new FormControl({ value: '', disabled: true }, [Validators.pattern('[- +()0-9]+')]),
        jobTitle: new FormControl({ value: '', disabled: true }),
    });

    readonly companyForm = new FormGroup({
        location: new FormControl({ value: '', disabled: true }),
        companyName: new FormControl({ value: '', disabled: true }, [Validators.required]),
        companyPostCode: new FormControl({ value: '', disabled: true }),
        companyAddress: new FormControl({ value: '', disabled: true }),
        companyTelephone: new FormControl({ value: '', disabled: true }),
        companyEmail: new FormControl({ value: '', disabled: true }, [Validators.email]),
    });

    ngOnInit(): void {
        this.setEcmUserFields();
    }

    getEcmUserInfo(): Observable<EcmUserModel> {
        return from(this.ecmUserService.peopleApi.getPerson('-me-')).pipe(map(personEntry => new EcmUserModel(personEntry.entry)));
    }

    getEcmAvatar(avatarId: any): string {
        return this.ecmUserService.getUserProfileImage(avatarId);
    }

    onUploadAvatar(e: any) {
        e.stopPropagation();
        e.preventDefault();

        this.ecmUser$ = from(this.ecmUserService.peopleApi.updateAvatarImage('-me-', e.detail.files[0].file)).pipe(
            delay(1000),
            take(1),
            concatMap(() => this.getEcmUserInfo()),
        );
    }

    toggleGeneralForm(edit: boolean) {
        this.generalFormDisabled = !edit;

        if (edit) {
            this.generalForm.enable();
            this.disabledFields.forEach(field => {
                this.generalForm.get(field)?.disable();
            });
        } else {
            this.generalForm.disable();
            this.setEcmUserFields();
        }
    }

    toggleCompanyForm(edit: boolean) {
        this.companyFormDisabled = !this.companyFormDisabled;

        if (edit) {
            this.companyForm.enable();
            this.disabledFields.forEach(field => {
                this.companyForm.get(field)?.disable();
            });
        } else {
            this.companyForm.disable();
            this.setEcmUserFields();
        }
    }

    onSaveGeneralData(event: FormGroup) {
        this.generalFormDisabled = !this.generalFormDisabled;
        this.updateGeneralDetails(event);
    }

    onSaveCompanyData(event: FormGroup) {
        this.companyFormDisabled = !this.companyFormDisabled;
        this.updateCompanyDetails(event);
    }

    private updateGeneralDetails(event: FormGroup) {
        if (this.generalForm.valid) {
            this.ecmUserService.peopleApi
                .updatePerson('-me-', {
                    userStatus: event.value.status,
                    description: event.value.description,
                    jobTitle: event.value.jobTitle,
                    telephone: event.value.telephone,
                    mobile: event.value.mobile,
                    company: {
                        organization: event.value.companyName,
                        postcode: event.value.companyPostCode,
                        address1: event.value.companyAddress,
                        telephone: event.value.companyTelephone,
                        email: event.value.companyEmail,
                    },
                })
                .then(() => {
                    this.generalForm.disable();
                    this.setEcmUserFields();
                })
                .catch(error => {
                    this.setEcmUserFields();
                    throwError(error);
                });
        } else {
            this.setEcmUserFields();
        }
    }

    private updateCompanyDetails(event: FormGroup) {
        if (this.companyForm.valid) {
            this.ecmUserService.peopleApi
                .updatePerson('-me-', {
                    location: event.value.location,
                    company: {
                        organization: event.value.companyName,
                        postcode: event.value.companyPostCode,
                        address1: event.value.companyAddress,
                        telephone: event.value.companyTelephone,
                        email: event.value.companyEmail,
                    },
                })
                .then(() => {
                    this.companyForm.disable();
                    this.setEcmUserFields();
                })
                .catch(error => {
                    this.setEcmUserFields();
                    throwError(error);
                });
        } else {
            this.setEcmUserFields();
        }
    }

    private setEcmUserFields(): void {
        this.getEcmUserInfo()
            .pipe(take(1))
            .subscribe((data: EcmUserModel) => {
                this.generalForm.setValue({
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    status: data.userStatus ?? '',
                    description: data.description ?? '',
                    email: data.email ?? '',
                    mobile: data.mobile ?? '',
                    jobTitle: data.jobTitle ?? '',
                });

                this.companyForm.setValue({
                    location: data.location ?? '',
                    companyName: data.company?.organization ?? '',
                    companyPostCode: data.company?.organization ?? '',
                    companyAddress: data.company?.address1 ?? '',
                    companyTelephone: data.company?.telephone ?? '',
                    companyEmail: data.company?.email ?? '',
                });
            });
    }
}
