import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EsriMapComponent } from './shared/esri-map/esri-map.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppMainComponent} from './app.main.component';
import {AppTopBarComponent} from './app.topbar.component';
import {AppConfigComponent} from './app.config.component';
import {AppMenuComponent} from './app.menu.component';
import {AppMenuitemComponent} from './app.menuitem.component';

// PrimeNG
import {RadioButtonModule} from 'primeng/radiobutton';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MenuService} from './app.menu.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BreadcrumbService } from './app.breadcrumb.service';
import { HomeComponent } from './features/home/home.component';
import { NewFeatureComponent } from './features/new-feature/new-feature.component';
import { MyFeaturesComponent } from './features/my-features/my-features.component';
import {TableModule} from 'primeng/table';
import {BadgeModule} from 'primeng/badge';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DialogModule} from 'primeng/dialog';

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent,
    AppMainComponent,
    AppTopBarComponent,
    AppConfigComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    HomeComponent,
    NewFeatureComponent,
    MyFeaturesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RadioButtonModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    BadgeModule,
    ConfirmDialogModule,
    DialogModule,
  ],
  providers: [
    // {provide: LocationStrategy, useClass: HashLocationStrategy},
    MenuService,
    BreadcrumbService,
    ConfirmationService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
