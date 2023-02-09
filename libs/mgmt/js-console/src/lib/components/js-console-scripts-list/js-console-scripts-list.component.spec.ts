import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleScriptsListComponent } from './js-console-scripts-list.component';

describe('JsConsoleScriptsListComponent', () => {
    let component: JsConsoleScriptsListComponent;
    let fixture: ComponentFixture<JsConsoleScriptsListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleScriptsListComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleScriptsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
