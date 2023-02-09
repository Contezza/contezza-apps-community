import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBrowserSearchComponent } from './node-browser-search.component';

describe('NodeBrowserSearchComponent', () => {
    let component: NodeBrowserSearchComponent;
    let fixture: ComponentFixture<NodeBrowserSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NodeBrowserSearchComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NodeBrowserSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
