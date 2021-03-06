import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { FeatureService } from 'src/app/core/services/feature.service';
import { MessageService } from 'primeng/api';
import { StateService } from 'src/app/core/services/state.service';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { Feature } from 'src/app/core/models/feature.model';
import { MsalBroadcastService } from '@azure/msal-angular';
import { filter, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-load-feature',
  templateUrl: './load-feature.component.html',
  styleUrls: ['./load-feature.component.scss']
})
export class LoadFeatureComponent implements OnInit, OnDestroy {
  featureName:string;
  hash:string;
  routeSub:Subscription;
  geojsonLayer:GeoJSONLayer;
  doneLoading:boolean = false;
  isOwnerOrContributor:boolean = false;
  currentUser:AccountInfo;
  private readonly _destroying$ = new Subject<void>();
  feature:Feature;
  msalSubscription:Subscription;
  constructor(private route: ActivatedRoute,private geoJsonHelper:GeoJsonHelperService, private loadingService:LoadingService,
    private featureService:FeatureService, private messageService:MessageService, private msalBroadcastService:MsalBroadcastService,
    private stateService:StateService) { }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.msalSubscription) {
      this.msalSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loadingService.incrementLoading();
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureName = params.get('featureName');
      this.hash = params.get('hash');
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
      this.checkIfFeatureExist();
    }, err=>{
      console.log("Error:", err);
      this.loadingService.decrementLoading();
    });
  }

  checkIfFeatureExist(){
    this.loadingService.incrementLoading();
    this.featureService.getFeatureByName(this.featureName).toPromise().then(feature=>{
      this.currentUser = this.stateService.getCurrentUser();
      console.log("feature:", feature);
      console.log("feature.owner.GUID:", feature.owner.guid);
      console.log("oid:", (this.currentUser?.idTokenClaims as OIDToken)?.oid);
      this.isOwnerOrContributor = this.checkIfUserIsContributorOrOwner(this.currentUser, feature);
      this.loadingService.decrementLoading();
      this.feature = feature;
      if (this.hash != null || this.hash != undefined) {
        this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(`https://raw.githubusercontent.com/dshackathon/${feature.id}/${this.hash}/data.geojson`);
      } else {
        this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(feature.gitHubRawURL);
      }      
      this.doneLoading = true;
      this.loadingService.decrementLoading();
    }, err=>{
      this.loadingService.decrementLoading();
      if (err.error = "No feature found with that name"){
        this.messageService.add({severity:'info', summary: 'Info', detail: 'No feature with that name was found.  Please check the name of the feature and try again.'});
        this.loadingService.decrementLoading();
      }
    });
  }

  checkIfUserIsContributorOrOwner(currentUser:AccountInfo, feature:Feature):boolean{
    if (currentUser == null || currentUser == undefined) {
      return false;
    }
    if (feature.owner == null || feature.owner == undefined) {
      return false;
    }
    if (feature.owner.guid == (this.currentUser?.idTokenClaims as OIDToken)?.oid) {
      return true;
    }
    if (feature.contributors == null || feature.contributors == undefined)  {
      return false;
    }
    if (feature.contributors.length == 0) {
      return false;
    } else {
      let isContributor:boolean = false;
      feature.contributors.forEach(contributor=>{
        if (contributor.email == currentUser.username) {
          isContributor = true;
        }
      });
      return isContributor;
    }    
  }

}
