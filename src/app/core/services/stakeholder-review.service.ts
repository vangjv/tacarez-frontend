import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stakeholders } from '../models/stakeholders.model';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { StakeholderReviewRequest } from '../models/stakeholder-review-request.model';
import { MergeRequest } from '../models/merge-request.model';

@Injectable({
  providedIn: 'root'
})
export class StakeholderReviewService {
  apiEndpoint = environment.tacarezAPIEndpoint;  
  constructor(private httpClient: HttpClient) { }

  sendStakeholderReviewRequest(stakeholderReviewRequst:StakeholderReviewRequest){
    return this.httpClient.post<MergeRequest>(this.apiEndpoint + "/api/stakeholderreview", stakeholderReviewRequst);
  }
}
