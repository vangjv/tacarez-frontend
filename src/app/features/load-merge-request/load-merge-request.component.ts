import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { MessageService } from 'primeng/api';
import { StateService } from 'src/app/core/services/state.service';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { MergeService } from 'src/app/core/services/merge.service';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
import { MsalBroadcastService } from '@azure/msal-angular';
import { filter, takeUntil } from 'rxjs/operators';
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
  featuregeojsonLayer:GeoJSONLayer;
  doneLoading:boolean = false;
  isOwnerOrContributor:boolean = false;
  currentUser:AccountInfo;
  mergeRequest:MergeRequest;
  msalSubscription:Subscription;
  private readonly _destroying$ = new Subject<void>();
  constructor(private route: ActivatedRoute,private geoJsonHelper:GeoJsonHelperService, private loadingService:LoadingService,
    private mergeService:MergeService, private messageService:MessageService, private stateService:StateService,
    private msalBroadcastService:MsalBroadcastService,) { }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.msalSubscription) {
      this.msalSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureName = params.get('featureName');
      this.mergeId = params.get('mergeId');
      this.waitForAuthentication();
    });    
  }

  waitForAuthentication(){
    this.msalSubscription = this.msalBroadcastService.inProgress$
    .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.checkIfMergeRequestExist();
    }, err=>{
      console.log("Error:", err);
      this.loadingService.decrementLoading();
    });
  }

  checkIfMergeRequestExist(){
    this.loadingService.incrementLoading();
    this.mergeService.getMergeRequestsByNameAndId(this.featureName, this.mergeId).toPromise().then(mergeRequest=>{
      this.mergeRequest = mergeRequest;
      this.currentUser = this.stateService.getCurrentUser();
      console.log("mergeRequest:", mergeRequest);
      console.log("mergeRequest.owner.GUID:", mergeRequest.owner.guid);
      console.log("oid:", (this.currentUser?.idTokenClaims as OIDToken)?.oid);
      this.isOwnerOrContributor = this.checkIfUserIsContributorOrOwner(this.currentUser,mergeRequest);
      this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(mergeRequest.gitHubRawURL);
      this.geojsonLayer.title = "Merge changes";
      this.featuregeojsonLayer = this.geoJsonHelper.loadGeoJSONLayer("https://api.tacarez.com/api/geojson/" + this.mergeRequest.featureName);
      this.featuregeojsonLayer.title = this.mergeRequest.featureName;
      this.doneLoading = true;
      this.loadingService.decrementLoading();
    }, err=>{
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'info', summary: 'Info', detail: 'There was an error when trying to find your merge request.'});
    });
  }

  checkIfUserIsContributorOrOwner(currentUser:AccountInfo, mergeRequest:MergeRequest):boolean{
    if (currentUser == null || currentUser == undefined) {
      return false;
    }
    if (mergeRequest.owner == null || mergeRequest.owner == undefined) {
      return false;
    }
    if (mergeRequest.owner.guid == (this.currentUser?.idTokenClaims as OIDToken)?.oid) {
      return true;
    }
    if (mergeRequest.contributors == null || mergeRequest.contributors == undefined)  {
      return false;
    }
    if (mergeRequest.contributors.length == 0) {
      return false;
    } else {
      let isContributor:boolean = false;
      mergeRequest.contributors.forEach(contributor=>{
        if (contributor.email == currentUser.username) {
          isContributor = true;
        }
      });
      return isContributor;
    }    
  }
}
