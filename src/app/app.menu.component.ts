import {Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-menu',
    template: `
        <div class="menu">
            <ul class="layout-menu">
                <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
            </ul>
        </div>
    `
})
export class AppMenuComponent implements OnInit {

    model: any[];

    ngOnInit() {
        this.model = [
            // {label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/']},
            {
                label: 'My Features',  routerLink: ['/myfeatures']
            },
            {
                label: 'My Revisions',  routerLink: ['/myrevisions']
            },
            {
                label: 'New Feature',  routerLink: ['/new']
            },
            {
                label: 'Open Feature',  routerLink: ['/openfeature']
            },
            {
                label: 'Recent',  routerLink: ['/recent']
            },
            {
                label: 'Explore',  routerLink: ['/explore']
            }
        ];
    }
}
