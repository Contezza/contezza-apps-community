import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/utils';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface ContezzaSearchContentType {
    name: string;
    value: string;
}

@Component({
    selector: 'contezza-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss'],
    host: { class: 'contezza-search-form' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class SearchFormComponent implements OnInit {
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
