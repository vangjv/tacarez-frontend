import {Component, OnDestroy, OnInit} from '@angular/core';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { BreadcrumbService } from './app.breadcrumb.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { StateService } from './core/services/state.service';
import { AccountInfo } from '@azure/msal-browser';
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit, OnDestroy{
    userMenu:Menu;
    userMenuItems: MenuItem[];
    subscription: Subscription;
    items: MenuItem[];
    signInMenuItems: MenuItem[];
    currentUser:AccountInfo;
    userSubscription:Subscription;

    constructor(public breadcrumbService: BreadcrumbService, public app: AppComponent, public appMain: AppMainComponent,
        private stateService:StateService) {
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });
    }

    ngOnInit(): void {
        this.userSubscription = this.stateService.stateChanged.subscribe(state=>{
            if (state.currentUser) {
                this.currentUser = state.currentUser;
                this.userMenuItems = [
                    {
                        label: this.currentUser?.name, 
                        icon: 'pi pi-fw pi-user'
                    },
                    {
                        label: 'Log out', 
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => {
                            this.logout();
                        }
                    }
                ];
            }
        })
        this.items = [
            {label: 'New', icon: 'pi pi-fw pi-plus'},
            {label: 'Open', icon: 'pi pi-fw pi-download'},
            {label: 'Undo', icon: 'pi pi-fw pi-refresh'}
        ];

        this.signInMenuItems = [
            {
                label: 'Login', 
                icon: 'pi pi-fw pi-sign-in',
                command: () => {
                    this.login();
                }
            }
        ];
        
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    login(){
        this.app.login();
    }

    logout() {
        this.app.logout();
    }
}
