import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DestroyService } from '@contezza/core/services';

interface ContezzaSearchContentType {
    name: string;
    value: string;
}

@Component({
    standalone: true,
    selector: 'contezza-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss'],
    host: { class: 'contezza-search-form' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatAutocompleteModule, TranslateModule],
})
export class ContezzaSearchFormComponent implements OnInit {
    searchTerm = '';
    contentTypeControl = new FormControl();

    contentTypeOptions: Array<ContezzaSearchContentType> = [
        { name: 'APP.CONTENT_TYPES.ALL', value: '*' },
        { name: 'APP.CONTENT_TYPES.FOLDER', value: 'cm:folder' },
        { name: 'APP.CONTENT_TYPES.FILE', value: 'cm:content' },
    ];

    filteredContentTypeOptions: Observable<Array<ContezzaSearchContentType>>;

    @Input()
    title: string;

    @Input()
    searchInput = new FormControl();

    @Input()
    showContentTypeFilter: boolean;

    @Input()
    loading: boolean;

    @Input()
    debounceTime = 700;

    @Input()
    minChars = 0;

    @Output()
    searchValue = new EventEmitter<string>();

    @Output()
    typeValue = new EventEmitter<string>();

    @Output()
    clearSearch = new EventEmitter();

    @ViewChild('input')
    inputField: ElementRef;

    constructor(private readonly translate: TranslateService, @Inject(DestroyService) readonly destroy$: DestroyService) {}

    ngOnInit(): void {
        this.searchInput.valueChanges
            .pipe(
                debounceTime(this.debounceTime),
                filter((value) => !value || (typeof value === 'string' && value.length >= this.minChars))
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((searchValue) => {
                this.searchTerm = searchValue;
                this.searchValue.emit(searchValue);
            });

        this.contentTypeControl.setValue(this.contentTypeOptions[0]);
        this.filteredContentTypeOptions = this.contentTypeControl.valueChanges.pipe(
            startWith<string | ContezzaSearchContentType>(''),
            map((value) => (typeof value === 'string' ? value : value.name)),
            map((name) => (name ? this._filter(name) : this.contentTypeOptions.slice()))
        );
    }

    displayContentTypeFn(type?: ContezzaSearchContentType): string | undefined {
        return type ? this.translate.instant(type?.name) : undefined;
    }

    private _filter(name: string): ContezzaSearchContentType[] {
        return this.contentTypeOptions.filter((option) => this.translate.instant(option.name).toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    focus() {
        this.inputField.nativeElement.focus();
    }

    clear(event): void {
        event.stopPropagation();
        this.searchTerm = '';
        this.searchValue.emit('');
        this.clearSearch.emit();
    }

    onTypeSelected(contentType: ContezzaSearchContentType) {
        this.typeValue.emit(contentType.value);
        this.filteredContentTypeOptions = of(this.contentTypeOptions.slice());
    }
}
