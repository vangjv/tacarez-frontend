import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { MessageService } from 'primeng/api';
import { Subscription, Subject } from 'rxjs';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import { MergeService } from 'src/app/core/services/merge.service';
import { StateService } from 'src/app/core/services/state.service';

@Component({
  selector: 'app-screen-shot-viewer',
  templateUrl: './screen-shot-viewer.component.html',
  styleUrls: ['./screen-shot-viewer.component.scss']
})
export class ScreenShotViewerComponent implements OnInit {
  featureName:string;
  mergeId:string;
  hash:string;
  routeSub:Subscription;
  geojsonLayer:GeoJSONLayer;
  doneLoading:boolean = false;
  isOwnerOrContributor:boolean = false;
  currentUser:AccountInfo;
  mergeRequest:MergeRequest;
  private readonly _destroying$ = new Subject<void>();
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
      this.checkIfMergeRequestExist();
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
      this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(mergeRequest.gitHubRawURL);
      this.doneLoading = true;
      this.loadingService.decrementLoading();
    }, err=>{
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'info', summary: 'Info', detail: 'There was an error when trying to find your merge request.'});
    });
  }
}
