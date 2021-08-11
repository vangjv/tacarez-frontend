import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ContributorsService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient: HttpClient) { }

  updateFeatureContributors(updateContributor:User[], id: string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/api/contributors/feature/" + id, updateContributor);
  }

  updateRevisionContributors(updateContributor:User[], featureName: string, revisionName:string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/api/contributors/revision/" + featureName + "/" + revisionName, updateContributor);
  }

  updateMergeRequestContributors(updateContributor:User[], featureName: string, mergeId:string){
    return this.httpClient.put<User[]>(this.apiEndpoint + "/api/contributors/mergerequest/" + featureName + "/" + mergeId, updateContributor);
  }
}
