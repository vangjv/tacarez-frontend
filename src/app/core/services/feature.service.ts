import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature } from 'src/app/core/models/feature.model';
import { NewFeatureRequest } from 'src/app/core/models/new-feature-request.model';
import { environment } from 'src/environments/environment';
import { UpdateFeatureRequest } from '../models/update-feature-request.model';
@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient:HttpClient) { }
  
  getAllFeatures(){
    return this.httpClient.get<Feature[]>(this.apiEndpoint + "/api/features");
  }

  getFeatureByName(featureName:string){
    return this.httpClient.get<Feature>(this.apiEndpoint + "/api/features/" + featureName);
  }

  getFeaturesByUser(userGUID:string){
    return this.httpClient.get<Feature[]>(this.apiEndpoint + "/api/features/user/" + userGUID);
  }

  createFeature(newFeatureRequest:NewFeatureRequest){
    return this.httpClient.post<Feature>(this.apiEndpoint + "/api/features", newFeatureRequest);
  }

  updateFeature(updateFeatureRequest:UpdateFeatureRequest, featureName:string, branch:string){
    return this.httpClient.put<Feature>(this.apiEndpoint + "/api/features/" + featureName + "/" + branch, updateFeatureRequest);
  }
  
}
