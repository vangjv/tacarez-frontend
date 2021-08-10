import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ContributorsService {
  apiEndpoint:string = "https://tacarezapi.azurewebsites.net/api/contributors"
  constructor(private httpClient: HttpClient) { }

  updateContributor(updateContributor:User[], id: string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/" + id, updateContributor);
  }
}
