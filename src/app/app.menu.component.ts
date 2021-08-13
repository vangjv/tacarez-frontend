import {Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { Subscription } from 'rxjs';
import { StateService } from './core/services/state.service';

@Component({
    selector: 'app-menu',
    template: `
        <div class="menu">
            <ul class="layout-menu">
                <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
            </ul>
        </div>
        <p-dialog header="Open Map Feature" [(visible)]="showOpenFeature" [style]="{width: '50vw'}">
        <div [formGroup]="openMapFeatureForm">
            <div class="grid" >
                <div class="col-12 md:4">
                    <div class="p-fluid">
                        <div class="p-field mb-3">
                            <label class="mr-2">Feature name</label>
                            <input type="Text" pInputText [style]="{'width': '100%'}" formControlName="featureName">
                        </div>                      
                    </div>
                </div>
            </div>
            <p-footer>
                <div class="flex justify-content-end">
                    <button pButton (click)="openMapFeature()" [disabled]="openMapFeatureForm.invalid">Open</button>
                </div>
            </p-footer>
        </div>    
    </p-dialog>
    `
})
export class AppMenuComponent implements OnInit, OnDestroy {
    openMapFeatureForm:FormGroup;
    showOpenFeature:boolean = false;
    model: any[];
    currentUser:AccountInfo = null;
    stateSubscription:Subscription;
    constructor(private router:Router, private stateService:StateService) {

    }
    ngOnDestroy(): void {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.stateSubscription = this.stateService.stateChanged.subscribe(state=>{
            if (state.currentUser) {
                this.currentUser = state.currentUser;
                this.setSideMenuItems();
            }
        });
        this.currentUser = this.stateService.getCurrentUser();
        this.setSideMenuItems();
        this.openMapFeatureForm = this.createOpenMapFeatureForm();        
    }

    setSideMenuItems(){
        if (this.currentUser != null) {
            this.model = [
                // {label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/']},
                {
                    label: 'My Features',  routerLink: ['/myfeatures']
                },
                {
                    label: 'My Revisions',  routerLink: ['/myrevisions']
                },
                {
                    label: 'My Merge Requests',  routerLink: ['/mymergerequests']
                },
                {
                    label: 'New Feature',  routerLink: ['/new']
                },
                {
                    label: 'Open Feature', command: ()=>{
                        this.showOpenFeature = true;
                    }
                },
                // {
                //     label: 'Recent',  routerLink: ['/recent']
                // },
                {
                    label: 'Explore',  routerLink: ['/explore']
                }
            ];
        } else {
            this.model = [
                {
                    label: 'New Feature',  routerLink: ['/new']
                },
                {
                    label: 'Open Feature', command: ()=>{
                        this.showOpenFeature = true;
                    }
                },
                {
                    label: 'Explore',  routerLink: ['/explore']
                }
            ];
        }
        
    }

    createOpenMapFeatureForm():FormGroup{
        return new FormGroup({
          featureName: new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z0-9 -]*')]),
        });
    }

    openMapFeature(){
        this.showOpenFeature = false;
        this.router.navigateByUrl("feature/" + this.openMapFeatureForm.value.featureName.replace(" ", "-"));
        this.openMapFeatureForm.reset();
    }
}
