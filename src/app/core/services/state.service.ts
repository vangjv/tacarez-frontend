import { Injectable } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser';
import { ObservableStore } from '@codewithdan/observable-store';
import { AppState } from 'src/app/core/models/app-state.model';

@Injectable({
  providedIn: 'root'
})
export class StateService extends ObservableStore<AppState>{  
  constructor() {
    const initialState = {
      currentUser: null
    }
    super({ trackStateHistory: true });
    this.setState(initialState, 'INIT_STATE');
  }

  setCurrentUser(currentUser:AccountInfo) {
    this.setState({ currentUser: currentUser }, 'set_current_user');
  }

  getCurrentUser():AccountInfo{
    const { currentUser } = this.getState();
    if (currentUser) {
        return currentUser
    }
    return null;
  }
}
