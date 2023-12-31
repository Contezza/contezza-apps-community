import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicForm, ContezzaDynamicFormField, ContezzaDynamicFormLayout } from '@contezza/dynamic-forms/shared';

import { DynamicFormFieldComponent } from '../dynamic-form-field/dynamic-form-field.component';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, DynamicFormFieldComponent],
    selector: 'contezza-dynamic-subform',
    templateUrl: './dynamic-subform.component.html',
    styleUrls: ['./dynamic-subform.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // apply style to first (outer) subform
    encapsulation: ViewEncapsulation.None,
})
export class ContezzaDynamicSubformComponent implements OnInit {
    @Input()
    layout: ContezzaDynamicFormLayout;

    @Input()
    readonly dynamicForm: ContezzaDynamicForm;

    field?: ContezzaDynamicFormField;
    control?: FormControl;

    @HostBinding('class')
    hostClass: string;

    @HostBinding('style')
    hostStyle: string;

    @HostBinding('tabindex')
    hostTabindex: number;

    ngOnInit() {
        this.hostClass = (this.layout.class || '') + ' dynamicforms-node';
        this.hostStyle = this.layout.style || '';
        this.hostTabindex = this.isTabbable(this.hostClass) ? 0 : -1;
        if (this.layout.type === 'field') {
            this.field = this.dynamicForm.getFieldById(this.layout.id);
            this.control = this.dynamicForm.getControlById(this.layout.id) as FormControl;
        }
    }

    @HostListener('keydown.enter', ['$event'])
    onEnterPressed(event) {
        if (event.target.classList.contains('dynamicforms-expansionpanel')) {
            event.target.classList.toggle('dynamicforms-expansionpanel-open');
            event.stopPropagation();
        }
    }

    @HostListener('click', ['$event'])
    onNodeClick(event) {
        if (event.target.classList.contains('dynamicforms-title') && event.target.parentElement.classList.contains('dynamicforms-expansionpanel')) {
            event.target.parentElement.classList.toggle('dynamicforms-expansionpanel-open');
        }
        event.stopPropagation();
    }

    private isTabbable(classList: string): boolean {
        const tabbableClasses = ['dynamicforms-expansionpanel'];
        return tabbableClasses.some((className) => classList?.includes(className));
    }
}
