import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBrowserViewItemComponent } from './view-item.component';

describe('NodeBrowserViewItemComponent', () => {
    let component: NodeBrowserViewItemComponent;
    let fixture: ComponentFixture<NodeBrowserViewItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NodeBrowserViewItemComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NodeBrowserViewItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
