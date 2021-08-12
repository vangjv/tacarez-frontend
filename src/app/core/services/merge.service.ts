import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MergeRequestRequest } from '../models/merge-request-request.model';
import { MergeRequest } from '../models/merge-request.model';
import { NewRevisionRequest } from '../models/new-revision-request.model';
import { UpdateFeatureRequest } from '../models/update-feature-request.model';

@Injectable({
  providedIn: 'root'
})
export class MergeService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient:HttpClient) { }

  createMergeRequest(mergeRequestRequest:MergeRequestRequest){
    return this.httpClient.post<MergeRequest>(this.apiEndpoint + "/api/mergerequest", mergeRequestRequest);
  }

  getMergeRequestsByUser(userGUID:string){
    return this.httpClient.get<MergeRequest[]>(this.apiEndpoint + "/api/mergerequest/user/" + userGUID);
  }

  getMergeRequestsByNameAndId(featureName:string, mergeId:string){
    return this.httpClient.get<MergeRequest>(this.apiEndpoint + "/api/mergerequest/feature/" + featureName + "/" + mergeId);
  }

  updateMergeRequest(updateFeatureRequest:UpdateFeatureRequest, featureName:string, mergeId:string){
    return this.httpClient.put<MergeRequest>(this.apiEndpoint + "/api/mergerequest/feature/" + featureName + "/" + mergeId, updateFeatureRequest);
  }
}
