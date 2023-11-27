import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { from, Observable, of, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { AlfrescoApiService, FormBaseModule, FormFieldModel, FormModel, FormService, PipeModule, User, WidgetComponent } from '@alfresco/adf-core';
import { Group, GroupsApi, PeopleApi } from '@alfresco/js-api';

import { WebscriptService } from '@contezza/core/services';
import { IncludesPipe } from '@contezza/core/pipes';

import { AvatarImagePipe, DisplayNamePipe, UserFullNamePipe } from '../pipes';

export type PeoplePickerType = 'people' | 'group' | 'people-group';

interface PeoplePickerEntry {
    id: PeoplePickerType;
    label: string;
}

@Component({
    selector: 'contezza-people-group-picker',
    standalone: true,
    imports: [
        CommonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        AvatarImagePipe,
        DisplayNamePipe,
        UserFullNamePipe,
        MatInputModule,
        TranslateModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatSelectModule,
        FormBaseModule,
        PipeModule,
        IncludesPipe,
    ],
    templateUrl: './people-group-picker.component.html',
    styleUrls: ['./people-group-picker.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContezzaPeopleGroupPickerComponent extends WidgetComponent {
    types: Array<PeoplePickerEntry> = [
        { id: 'people', label: 'Gebruiker' },
        { id: 'group', label: 'Groep' },
    ];

    _pickerType: PeoplePickerType;

    filteredTypes: Array<PeoplePickerEntry> = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    errorMsg = '';

    visible = true;
    selectable = true;
    removable = true;

    searchTerm = new FormControl('');
    searchTerms$: Observable<any> = this.searchTerm.valueChanges;

    @Input()
    selectedItems: Array<User | Group> = [];

    @Input()
    set pickerType(type: PeoplePickerType) {
        if (type) {
            this._pickerType = type;
            this.filteredTypes = type === 'people-group' ? this.types : this.types.filter((type) => type.id === this._pickerType);
        }
    }

    @Input()
    showChips = true;

    @Input()
    showInputValue = false;

    @Input()
    peoplePlaceholder: string;

    @Input()
    groupPlaceholder: string;

    @Input()
    existingPeople: any[] = [];

    @Input()
    max = 100;

    @Input()
    skipSystemGroupsFiltering: boolean;

    @Output()
    onItemsChange = new EventEmitter<(User | Group)[]>();

    @Output()
    onSelectedItem = new EventEmitter<User | Group>();

    _peopleApi: PeopleApi;
    get peopleApi(): PeopleApi {
        this._peopleApi = this._peopleApi ?? new PeopleApi(this.apiService.getInstance());
        return this._peopleApi;
    }

    _groupsApi: GroupsApi;
    get groupsApi() {
        this._groupsApi = this._groupsApi ?? new GroupsApi(this.apiService.getInstance());
        return this._groupsApi;
    }

    @ViewChild('auto', { static: true })
    matAutocomplete: MatAutocomplete;

    @ViewChild('inputValue', { static: true })
    input: ElementRef;

    users$ = this.searchTerms$.pipe(
        tap(() => (this.errorMsg = '')),
        filter(() => !!this._pickerType),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((searchTerm) =>
            typeof searchTerm === 'string' && this._pickerType === 'people'
                ? from(this.getUsers(searchTerm)).pipe(
                      catchError((err) => {
                          this.errorMsg = err.message;
                          return of([]);
                      })
                  )
                : of([])
        )
    );

    groups$ = this.searchTerms$.pipe(
        tap(() => (this.errorMsg = '')),
        filter(() => !!this._pickerType),
        distinctUntilChanged(),
        debounceTime(250),
        switchMap((searchTerm) =>
            typeof searchTerm === 'string' && this._pickerType === 'group'
                ? from(this.getGroups(searchTerm)).pipe(
                      catchError((err) => {
                          this.errorMsg = err.message;
                          return of([]);
                      })
                  )
                : of([])
        )
    );

    constructor(public readonly formService: FormService, private readonly apiService: AlfrescoApiService, private readonly webscript: WebscriptService) {
        super(formService);
        this.field = new FormFieldModel(new FormModel(), {});
    }

    onTypeChange(type): void {
        this._pickerType = type.id;
        this.input.nativeElement.value = '';
    }

    onItemSelect(item: User | Group | any): void {
        this.input.nativeElement.value = '';
        this.onSelectedItem.emit(item);

        if (this.showChips) {
            if (this.selectedItems.length < this.max) {
                this.selectedItems.push(item);
            } else {
                if (this.max === 1) {
                    this.selectedItems = [item];
                }
            }
            this.onItemsChange.emit(this.selectedItems);
        } else if (this.showInputValue) {
            this.input.nativeElement.value = item.firstName;
        }
    }

    removeItem(subject: User | Group): void {
        const index = this.selectedItems.indexOf(subject);
        if (index >= 0) {
            this.selectedItems.splice(index, 1);
        }
        this.onItemsChange.emit(this.selectedItems);
    }

    clearSelectedItems(): void {
        this.selectedItems = [];
        this.onItemsChange.emit(this.selectedItems);
    }

    clearInputValue(): void {
        this.input.nativeElement.value = '';
    }

    getPerson(personId: string, options: any): Observable<any> {
        const promise = this.peopleApi.getPerson(personId, options);

        return from(promise).pipe(catchError((error) => throwError(error || 'Server error')));
    }

    itemExist(entity: User | Group): boolean {
        return (
            (this.selectedItems.length > 0 &&
                !!this.selectedItems.some((selected) => ('userName' in entity ? selected['userName'] === entity['userName'] : selected.id === entity.id))) ||
            (this.existingPeople.length > 0 && !!this.existingPeople.some((existing) => existing.roltoelichting.split('|')[0] === entity['userName']))
        );
    }

    private async getUsers(searchTerm: string): Promise<any> {
        const users: Array<User> = [];
        const paging = await this.webscript.get<any>(`api/people?filter=${searchTerm}`).toPromise();

        if (paging?.people?.length > 0) {
            users.push(...paging.people.map((people) => people));
        }
        return users;
    }

    private async getGroups(searchTerm: string): Promise<Group[]> {
        const groups: Array<Group> = [];
        const paging = await this.groupsApi.listGroupMembershipsForPerson('-me-');

        if (paging?.list?.entries) {
            groups.push(...paging.list.entries.map((obj) => obj.entry));
        }

        return !this.skipSystemGroupsFiltering
            ? groups.filter(
                  (group) =>
                      !!group.displayName &&
                      !group.id.startsWith('GROUP_ALFRESCO_') &&
                      !group.id.startsWith('GROUP_TEZZA_') &&
                      !group.id.startsWith('GROUP_RECORD_') &&
                      !group.id.startsWith('GROUP_EMAIL_') &&
                      !group.id.startsWith('GROUP_SITE_') &&
                      !group.id.startsWith('GROUP_site_') &&
                      !group.id.startsWith('GROUP_Administrator') &&
                      group.displayName.toUpperCase().includes(searchTerm.toUpperCase())
              )
            : groups.filter((group: Group) => !!group.displayName && group.displayName.toUpperCase().includes(searchTerm.toUpperCase()));
    }
}
