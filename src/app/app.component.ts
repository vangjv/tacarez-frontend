import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionType, InteractionStatus, PopupRequest, RedirectRequest, AuthenticationResult, AuthError } from '@azure/msal-browser';
import { PrimeNGConfig } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { b2cPolicies } from './b2c-config';
import { LoadingService } from './core/loadingspinner/loading-spinner/loading.service';
import { StateService } from './core/services/state.service';

interface Payload extends AuthenticationResult {
    idTokenClaims: {
        tfp?: string
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    menuMode = 'overlay';
    lightMenu = true;
    inputStyle = 'outlined';
    ripple: boolean;
    private readonly _destroying$ = new Subject<void>();
    isIframe = false;
    loginDisplay = false;
    loadingModal:boolean = true;
    loadingMessage:string = "Loading...";
    loadingSubscription!:Subscription;
    constructor(private primengConfig: PrimeNGConfig, @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService, private msalBroadcastService: MsalBroadcastService, private stateService:StateService,
        private loadingService:LoadingService) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.ripple = true;
        this.isIframe = window !== window.parent && !window.opener;
        this.setLoginDisplay();

        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                let accounts = this.authService.instance.getAllAccounts();
                console.log("accounts:", this.authService.instance.getAllAccounts());
                console.log("accounts[0].idTokenClaims", JSON.stringify(accounts[0].idTokenClaims));
                // if (accounts.length > 0) {
                //     accounts.forEach(acc => {
                //         if (acc.tenantId != "c6d1856e-926c-480e-b15d-6c24d2ff3386") {
                //             localStorage.clear();
                //             this.ngOnInit();
                //         }
                //     })
                // }
                this.setLoginDisplay();
                this.checkAndSetActiveAccount();
            });

        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {

                let payload: Payload = <AuthenticationResult>result.payload;

                /**
                 * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
                 * from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy policies may use "acr" instead of "tfp").
                 * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
                 */
                if (payload.idTokenClaims['tfp'] === b2cPolicies.names.editProfile) {
                    window.alert('Profile has been updated successfully. \nPlease sign-in again.');
                    return this.logout();
                }

                return result;
            });

        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {
                // Add your auth error handling logic here
            });
    }

    setLoginDisplay() {
        this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this.authService.instance.getActiveAccount();
        this.stateService.setCurrentUser(activeAccount);
        if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
            let accounts = this.authService.instance.getAllAccounts();
            this.authService.instance.setActiveAccount(accounts[0]);
            this.stateService.setCurrentUser(accounts[0]);
        }
    }

    login(userFlowRequest?: RedirectRequest | PopupRequest) {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            } else {
                this.authService.loginPopup(userFlowRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.authService.instance.setActiveAccount(response.account);
                    });
            }
        } else {
            if (this.msalGuardConfig.authRequest) {
                this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
            } else {
                this.authService.loginRedirect(userFlowRequest);
            }
        }
    }

    logout() {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            this.authService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this.authService.logoutRedirect();
        }
        // this.authService.logout();
        // let activeAccount = this.authService.instance.getActiveAccount();
        // this.authService.logoutRedirect({
        //     account: activeAccount,
        //     postLogoutRedirectUri: "/"
        // });
    }

    editProfile() {
        let editProfileFlowRequest = {
            scopes: ["openid"],
            authority: b2cPolicies.authorities.editProfile.authority,
        };

        this.login(editProfileFlowRequest);
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
        if (this.loadingSubscription) {
            this.loadingSubscription.unsubscribe();
          }
          this._destroying$.next(undefined);
          this._destroying$.complete();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
          this.loadingSubscription = this.loadingService.loading$.subscribe(res=>{
            this.loadingModal = res.loading ? res.loading : false;
            this.loadingMessage = res.loadingMessage ? res.loadingMessage : "Loading...";
          });
        }, 1);
      }
}
