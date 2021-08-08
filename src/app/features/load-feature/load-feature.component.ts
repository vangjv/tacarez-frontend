import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { FeatureService } from 'src/app/core/services/feature.service';
import { MessageService } from 'primeng/api';
import { StateService } from 'src/app/core/services/state.service';
import { AccountInfo } from '@azure/msal-browser';
import { OIDToken } from 'src/app/core/models/id-token.model';
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
  constructor(private route: ActivatedRoute,private geoJsonHelper:GeoJsonHelperService, private loadingService:LoadingService,
    private featureService:FeatureService, private messageService:MessageService, private stateService:StateService) { }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loadingService.incrementLoading();
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureName = params.get('featureName');
      this.hash = params.get('hash');
      this.checkIfFeatureExist();
    });
    this.currentUser = this.stateService.getCurrentUser();
  }

  checkIfFeatureExist(){
    this.loadingService.incrementLoading();
    this.featureService.getFeatureByName(this.featureName).toPromise().then(feature=>{
      console.log("feature:", feature);
      console.log("feature.owner.GUID:", feature.owner.guid);
      console.log("oid:", (this.currentUser.idTokenClaims as OIDToken).oid);
      if (feature.owner.guid == (this.currentUser.idTokenClaims as OIDToken).oid) {
        this.isOwnerOrContributor = true;
      }
      this.loadingService.decrementLoading();
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
      }
    });
  }

}
