import {Component, OnInit} from '@angular/core';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';

@Component({
    selector: 'app-config',
    template: `
        <a style="cursor: pointer" id="layout-config-button" class="layout-config-button"
           (click)="onConfigButtonClick($event)">
            <i class="pi pi-cog"></i>
        </a>
        <div id="layout-config" class="layout-config" [ngClass]="{'layout-config-active': appMain.configActive}"
             (click)="appMain.onConfigClick($event)">
            <h5>Menu Mode</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="menuMode" value="static" [(ngModel)]="app.menuMode" inputId="menuMode1" (click)="appMain.menuInactiveDesktop = true"></p-radioButton>
                <label for="menuMode1">Static</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="menuMode" value="overlay" [(ngModel)]="app.menuMode" inputId="menuMode2" (click)="appMain.menuInactiveDesktop = true"></p-radioButton>
                <label for="menuMode2">Overlay</label>
            </div>

            <hr/>

            <h5>Menu Color</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="lightMenu" [value]="true" [(ngModel)]="app.lightMenu" inputId="lightMenu1"></p-radioButton>
                <label for="lightMenu1">Light</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="lightMenu" [value]="false" [(ngModel)]="app.lightMenu" inputId="lightMenu2"></p-radioButton>
                <label for="lightMenu2">Dark</label>
            </div>

            <hr/>

            <h5>Input Style</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="inputStyle" value="outlined" [(ngModel)]="app.inputStyle"
                               inputId="inputStyle1"></p-radioButton>
                <label for="inputStyle1">Outlined</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="inputStyle" value="filled" [(ngModel)]="app.inputStyle"
                               inputId="inputStyle2"></p-radioButton>
                <label for="inputStyle2">Filled</label>
            </div>

            <hr/>

            <h5>Ripple Effect</h5>
            <p-inputSwitch [ngModel]="app.ripple" (onChange)="appMain.onRippleChange($event)"></p-inputSwitch>

            <hr />

            <h5>Topbar Themes</h5>
            <div class="layout-themes">
                <div *ngFor="let theme of topbarThemes">
                    <a style="cursor: pointer" (click)="changeTopbarTheme(theme.name)" [ngStyle]="{'background-color': theme.color}">
                        <i class="pi pi-check" *ngIf="topbarColor === theme.name"></i>
                    </a>
                </div>
            </div>

            <hr />

            <h5>Component Themes</h5>
            <div class="layout-themes">
                <div *ngFor="let theme of componentThemes">
                    <a style="cursor: pointer" (click)="changeComponentTheme(theme.name)" [ngStyle]="{'background-color': theme.color}">
                        <i class="pi pi-check" *ngIf="componentColor === theme.name"></i>
                    </a>
                </div>
            </div>
        </div>
    `
})
export class AppConfigComponent implements OnInit{

    topbarThemes: any[];

    componentThemes: any[];

    topbarColor = 'light';

    componentColor = 'blue';

    constructor(public app: AppComponent, public appMain: AppMainComponent) {}

    ngOnInit() {
        this.topbarThemes = [
            {name: 'blue', color: '#0388e5'},
            {name: 'light', color: '#ffffff'},
            {name: 'dark', color: '#4d5058'},
        ];

        this.componentThemes = [
            {name: 'blue', color: '#2196F3'},
            {name: 'green', color: '#4CAF50'},
            {name: 'orange', color: '#FFC107'},
            {name: 'purple', color: '#9552a0'},
        ];
    }

    changeTopbarTheme(theme) {
        this.topbarColor = theme;
        const element = document.getElementById('layout-css');
        const urlTokens = element.getAttribute('href').split('/');
        urlTokens[urlTokens.length - 1] = 'layout-' + theme + '.css';
        const newURL = urlTokens.join('/');

        this.replaceLink(element, newURL);
    }

    changeComponentTheme(theme) {
        this.componentColor = theme;
        const element = document.getElementById('theme-css');
        const urlTokens = element.getAttribute('href').split('/');
        urlTokens[urlTokens.length - 1] = 'theme-' + theme + '.css';
        const newURL = urlTokens.join('/');

        this.replaceLink(element, newURL);
    }

    replaceLink(linkElement, href) {
        if (this.isIE()) {
            linkElement.setAttribute('href', href);
        }
        else {
            const id = linkElement.getAttribute('id');
            const cloneLinkElement = linkElement.cloneNode(true);

            cloneLinkElement.setAttribute('href', href);
            cloneLinkElement.setAttribute('id', id + '-clone');

            linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

            cloneLinkElement.addEventListener('load', () => {
                linkElement.remove();
                cloneLinkElement.setAttribute('id', id);
            });
        }
    }

    isIE() {
        return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
    }

    onConfigButtonClick(event) {
        this.appMain.configActive = !this.appMain.configActive;
        this.appMain.configClick = true;
        event.preventDefault();
    }
}
