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
import {CheckboxModule} from 'primeng/checkbox';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {MenuModule} from 'primeng/menu';

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import {TooltipModule} from 'primeng/tooltip';
import {MergeRequestComponent} from './features/merge-request/merge-request.component';



// Azure B2C
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';

import { b2cPolicies, apiConfig } from './b2c-config';
import { LogOutComponent } from './features/log-out/log-out.component';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;


export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '13a963f4-31ed-4265-b5dc-61ceaff4dd69',
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
      knownAuthorities: [b2cPolicies.authorityDomain]
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
    system: {
      allowRedirectInIframe: true,
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(apiConfig.uri, apiConfig.scopes);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...apiConfig.scopes],
    },
    loginFailedRoute: 'login-failed'
  };
}

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
    MyFeaturesComponent,
    MergeRequestComponent
    LogOutComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    MsalModule,
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
    TooltipModule,
    InputTextModule,
    CheckboxModule,
    DialogModule,
    InputTextModule
    MenuModule
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: MsalInterceptor,
    //   multi: true
    // },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    MenuService,
    BreadcrumbService,
    ConfirmationService,
    MessageService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
