import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { MessageService } from 'primeng/api';
import { StateService } from 'src/app/core/services/state.service';
import { AccountInfo } from '@azure/msal-browser';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { RevisionsService } from 'src/app/core/services/revisions.service';
import { MergeService } from 'src/app/core/services/merge.service';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
@Component({
  selector: 'app-load-merge-request',
  templateUrl: './load-merge-request.component.html',
  styleUrls: ['./load-merge-request.component.scss']
})
export class LoadMergeRequestComponent implements OnInit, OnDestroy {
  featureName:string;
  mergeId:string;
  hash:string;
  routeSub:Subscription;
  geojsonLayer:GeoJSONLayer;
  doneLoading:boolean = false;
  isOwnerOrContributor:boolean = false;
  currentUser:AccountInfo;
  mergeRequest:MergeRequest;
  constructor(private route: ActivatedRoute,private geoJsonHelper:GeoJsonHelperService, private loadingService:LoadingService,
    private mergeService:MergeService, private messageService:MessageService, private stateService:StateService) { }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureName = params.get('featureName');
      this.mergeId = params.get('mergeId');
      this.checkIfRevisionExist();
    });
    this.currentUser = this.stateService.getCurrentUser();
  }

  checkIfRevisionExist(){
    this.loadingService.incrementLoading();
    this.mergeService.getMergeRequestsByNameAndId(this.featureName, this.mergeId).toPromise().then(mergeRequest=>{
      this.mergeRequest = mergeRequest;
      console.log("mergeRequest:", mergeRequest);
      console.log("mergeRequest.owner.GUID:", mergeRequest.owner.guid);
      console.log("oid:", (this.currentUser?.idTokenClaims as OIDToken)?.oid);
      if (mergeRequest.owner.guid == (this.currentUser?.idTokenClaims as OIDToken)?.oid) {
        this.isOwnerOrContributor = true;
      }
      this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(mergeRequest.gitHubRawURL);
      this.doneLoading = true;
      this.loadingService.decrementLoading();
    }, err=>{
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'info', summary: 'Info', detail: 'There was an error when trying to find your merge request.'});
    });
  }
}
