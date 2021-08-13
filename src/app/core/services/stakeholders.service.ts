import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StakeholdersService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient: HttpClient) { }

  updateFeatureStakeholders(updateStakeholder:User[], id: string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/api/stakeholders/feature/" + id, updateStakeholder);
  }
}
