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
import { Revision } from 'src/app/core/models/revision.model';
@Component({
  selector: 'app-load-revision',
  templateUrl: './load-revision.component.html',
  styleUrls: ['./load-revision.component.scss']
})
export class LoadRevisionComponent implements OnInit, OnDestroy {
  featureName:string;
  revisionName:string;
  hash:string;
  routeSub:Subscription;
  geojsonLayer:GeoJSONLayer;
  doneLoading:boolean = false;
  isOwnerOrContributor:boolean = false;
  currentUser:AccountInfo;
  constructor(private route: ActivatedRoute,private geoJsonHelper:GeoJsonHelperService, private loadingService:LoadingService,
    private revisionService:RevisionsService, private messageService:MessageService, private stateService:StateService) { }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureName = params.get('featureName');
      this.revisionName = params.get('revisionName');
      this.checkIfRevisionExist();
    });
    this.currentUser = this.stateService.getCurrentUser();
  }

  checkIfRevisionExist(){
    this.loadingService.incrementLoading();
    this.revisionService.getRevisionsByName(this.featureName, this.revisionName).toPromise().then(revision=>{
      console.log("revision:", revision);
      console.log("feature.owner.GUID:", revision.owner.guid);
      console.log("oid:", (this.currentUser?.idTokenClaims as OIDToken)?.oid);
      this.isOwnerOrContributor = this.checkIfUserIsContributorOrOwner(this.currentUser,revision);
      this.geojsonLayer = this.geoJsonHelper.loadGeoJSONLayer(revision.gitHubRawURL);
      this.doneLoading = true;
      this.loadingService.decrementLoading();
    }, err=>{
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'info', summary: 'Info', detail: 'There was an error when trying to find your revision.  Please check the name of the feature and revision and try again.'});
    });
  }

  checkIfUserIsContributorOrOwner(currentUser:AccountInfo, revision:Revision):boolean{
    if (revision.owner == null || revision.owner == undefined) {
      return false;
    }
    if (revision.owner.guid == (this.currentUser?.idTokenClaims as OIDToken)?.oid) {
      return true;
    }
    if (revision.contributors == null || revision.contributors == undefined)  {
      return false;
    }
    if (revision.contributors.length == 0) {
      return false;
    } else {
      let isContributor:boolean = false;
      revision.contributors.forEach(contributor=>{
        if (contributor.email == currentUser.username) {
          isContributor = true;
        }
      });
      return isContributor;
    }    
  }
}
