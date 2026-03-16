import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleContentComponent } from './js-console-content.component';

describe('JsConsoleContentComponent', () => {
    let component: JsConsoleContentComponent;
    let fixture: ComponentFixture<JsConsoleContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleContentComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
