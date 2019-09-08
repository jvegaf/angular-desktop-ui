import {ApplicationRef, ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivationEnd, Event, NavigationEnd, Router} from "@angular/router";
import {DuiDialog} from "@marcj/angular-desktop-ui";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public sidebarVisible = true;
    public darkMode = false;
    public showDialog = false;

    public platform: string = 'darwin';

    public toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.setDarkMode(this.darkMode);
    }

    public setDarkMode(active: boolean) {
        document.body.classList.remove('dark');
        document.body.classList.remove('light');

        if (active) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.add('light');
        }
        localStorage.setItem('dui-darkmode', active ? 'true' : 'false');
    }

    public setPlatform(platform: string) {
        this.platform = platform;
        document.body.classList.remove('linux');
        document.body.classList.remove('darwin');
        document.body.classList.remove('win32');

        document.body.classList.add(platform);
        localStorage.setItem('dui-platform', platform);
    }

    constructor(
        router: Router,
        private a: ApplicationRef,
        public dialog: DuiDialog,
    ) {
        //necessary to render all router-outlet once the router changes
        router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd || event instanceof ActivationEnd) {
                a.tick();
            }
        });

        this.platform = localStorage.getItem('dui-platform') || 'darwin';
        console.log('wtf', localStorage.getItem('dui-platform'), this.platform);
        this.darkMode = (localStorage.getItem('dui-darkmode') || 'false') === 'true';
        this.setDarkMode(this.darkMode);
        this.setPlatform(this.platform);

        document.addEventListener('click', () => a.tick());
        document.addEventListener('focus', () => a.tick());
        document.addEventListener('blur', () => a.tick());
        document.addEventListener('keydown', () => a.tick());
        document.addEventListener('keyup', () => a.tick());
        document.addEventListener('keypress', () => a.tick());
        document.addEventListener('mousedown', () => a.tick());
    }
}
