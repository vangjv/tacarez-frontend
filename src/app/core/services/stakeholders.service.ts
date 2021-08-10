import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stakeholders } from '../models/stakeholders.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StakeholdersService {
  apiEndpoint:string = "https://tacarezapi.azurewebsites.net/api/stakeholders"
  constructor(private httpClient: HttpClient) { }

  getStakeholder(){
    return this.httpClient.get<Stakeholders[]>(this.apiEndpoint);
  }

  updateStakeholder(updateStakeholder:User[], id: string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/" + id, updateStakeholder);
  }
}
