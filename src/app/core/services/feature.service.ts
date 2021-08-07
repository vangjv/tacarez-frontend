import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature } from 'src/app/core/models/feature.model';
import { NewFeatureRequest } from 'src/app/core/models/new-feature-request.model';
import { environment } from 'src/environments/environment';
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

  createFeature(newFeatureRequest:NewFeatureRequest){
    return this.httpClient.post<Feature>(this.apiEndpoint + "/api/features", newFeatureRequest);
  }
}
