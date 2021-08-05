import { AccountInfo } from "@azure/msal-browser";

export interface AppState {
    currentUser: AccountInfo;
}