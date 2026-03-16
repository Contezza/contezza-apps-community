import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBrowserViewComponent } from './node-browser-view.component';

describe('NodeBrowserViewComponent', () => {
    let component: NodeBrowserViewComponent;
    let fixture: ComponentFixture<NodeBrowserViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NodeBrowserViewComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NodeBrowserViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
