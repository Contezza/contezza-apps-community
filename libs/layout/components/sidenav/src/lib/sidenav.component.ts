import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ResponsiveService } from '@contezza/core/responsive';
import { NavbarComponent, NavbarGroup } from '@contezza/layout/components/navbar';

import { CreateMenuComponent } from './components/create-menu/create-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { SidenavMode } from './models/sidenav-mode';
import { SidenavService } from './services/sidenav.service';

@Component({
    standalone: true,
    imports: [CommonModule, CreateMenuComponent, NavbarComponent, HeaderComponent],
    selector: 'contezza-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    host: { class: 'contezza-sidenav' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
    @Input()
    set data(value: { mode?: 'collapsed' | 'expanded' }) {
        if (value?.mode) {
            this.modeSource.next(value.mode as SidenavMode);
        }
    }

    private readonly modeSource = new BehaviorSubject<SidenavMode>(SidenavMode.EXPANDED);
    readonly mode$ = this.modeSource.asObservable();

    readonly createActions$ = this.sidenavService.createActions$;
    readonly groups$: Observable<NavbarGroup[]> = this.sidenavService.navbar$;

    readonly isMobile$ = this.responsive?.isMobile$;

    constructor(
        private readonly sidenavService: SidenavService,
        @Optional() private readonly responsive: ResponsiveService,
    ) {}
}
