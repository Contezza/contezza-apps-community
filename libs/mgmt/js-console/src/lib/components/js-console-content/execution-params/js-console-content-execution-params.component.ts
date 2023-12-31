import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';

import { getRunas, getTransaction, getUrlargs } from '../../../store/selectors';
import { setRunas, setTransaction, setUrlargs } from '../../../store/actions';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatSelectModule, TranslateModule],
    selector: 'contezza-js-console-content-execution-params',
    templateUrl: './js-console-content-execution-params.component.html',
    styleUrls: ['./js-console-content-execution-params.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class JsConsoleContentExecutionParamsComponent implements OnInit {
    form: FormGroup = this.fb.group({
        args: new FormControl(''),
        runas: new FormControl('', [Validators.required]),
        transaction: new FormControl('', [Validators.required]),
    });
    constructor(private readonly fb: FormBuilder, private readonly store: Store<unknown>, @Inject(DestroyService) readonly destroy$: DestroyService) {}

    get args() {
        return this.form.get('args');
    }

    get runas() {
        return this.form.get('runas');
    }

    get transaction() {
        return this.form.get('transaction');
    }

    ngOnInit(): void {
        combineLatest([this.store.select(getUrlargs), this.store.select(getRunas), this.store.select(getTransaction)])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([args, runas, transaction]) => {
                this.args.setValue(args);
                this.runas.setValue(runas);
                this.transaction.setValue(transaction);
            });

        this.args.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.store.dispatch(setUrlargs({ urlargs: value })));
        this.runas.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.store.dispatch(setRunas({ runas: value })));
        this.transaction.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.store.dispatch(setTransaction({ transaction: value })));
    }
}
