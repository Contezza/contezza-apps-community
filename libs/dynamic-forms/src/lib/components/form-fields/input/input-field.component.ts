import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';

import { DestroyService } from '@contezza/core/services';
import { MatInput } from '@angular/material/input';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-input-field',
    templateUrl: './input-field.component.html',
    styleUrls: ['./input-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class InputFieldComponent<ValueType extends string | number> extends ContezzaBaseFieldComponent<ValueType> implements OnInit {
    @ViewChild(MatInput)
    input: MatInput;

    inputType: 'number' | 'text';

    // constructor(@Inject(DestroyService) private readonly destroy$) {
    //     super();
    // }

    ngOnInit(): void {
        super.ngOnInit();
        this.inputType = this.field.type === 'int' || this.field.type === 'integer' || this.field.type === 'long' ? 'number' : 'text';
        // const autocorrectRegexs: string[] = this.field?.validations
        //     ?.filter((validation) => validation.type === 'pattern' && validation.autocorrect)
        //     .map((validation) => validation.value);
        // let wasEverTouched: boolean;
        // if (autocorrectRegexs?.length > 0) {
        //     this.control.valueChanges
        //         .pipe(
        //             takeUntil(this.destroy$),
        //             distinctUntilChanged(),
        //             filter((value) => value && typeof value === 'string' && autocorrectRegexs.some((regex) => !value.match(regex))),
        //             tap(() => {
        //                 if (this.control.touched) {
        //                     wasEverTouched = true;
        //                 }
        //                 this.control.markAsUntouched();
        //             }),
        //             debounceTime(200)
        //         )
        //         .subscribe((value) => {
        //             const newValue = this.correct(value, autocorrectRegexs);
        //             if (newValue) {
        //                 this.control.setValue(newValue);
        //             }
        //             if (wasEverTouched) {
        //                 this.control.updateValueAndValidity();
        //                 this.control.markAsTouched();
        //             }
        //         });
        // }
    }

    focusOnField(): void {
        this.input.focus();
    }

    // private correct(value: string, regexs: string[]): string | null {
    //     // strategy 1: all lowercase
    //     if (regexs.every((regex) => value.toLowerCase().match(regex))) {
    //         return value.toLowerCase();
    //     }
    //     // strategy 2: all uppercase
    //     if (regexs.every((regex) => value.toUpperCase().match(regex))) {
    //         return value.toUpperCase();
    //     }
    //     // strategy 3: capitalize
    //     if (regexs.every((regex) => this.capitalize(value).match(regex))) {
    //         return this.capitalize(value);
    //     }
    //     return null;
    // }

    // private capitalize(value: string): string {
    //     return value
    //         .split(' ')
    //         .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    //         .join(' ');
    // }
}
