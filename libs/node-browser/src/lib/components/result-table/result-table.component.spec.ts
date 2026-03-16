import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBrowserResultTableComponent } from './result-table.component';

describe('NodeBrowserResultTableComponent', () => {
    let component: NodeBrowserResultTableComponent<any>;
    let fixture: ComponentFixture<NodeBrowserResultTableComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NodeBrowserResultTableComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NodeBrowserResultTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
