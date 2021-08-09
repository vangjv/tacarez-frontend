import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NewRevisionRequest } from '../models/new-revision-request.model';
import { Revision } from '../models/revision.model';

@Injectable({
  providedIn: 'root'
})
export class RevisionsService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient:HttpClient) { }

  createRevision(newRevisionRequest:NewRevisionRequest){
    return this.httpClient.post<Revision>(this.apiEndpoint + "/api/revisions", newRevisionRequest);
  }

  getRevisionsByUser(userGUID:string){
    return this.httpClient.get<Revision[]>(this.apiEndpoint + "/api/revisions/user/" + userGUID);
  }

  getRevisionsByName(featurename:string, revisionName:string){
    return this.httpClient.get<Revision>(this.apiEndpoint + "/api/revisions/feature/" + featurename + "/" + revisionName);
  }
}
