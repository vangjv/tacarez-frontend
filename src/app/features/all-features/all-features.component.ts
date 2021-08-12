import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { FeatureService } from 'src/app/core/services/feature.service';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { Feature } from 'src/app/core/models/feature.model';
import { User } from 'src/app/core/models/user.model';
import { StateService } from 'src/app/core/services/state.service';
import { OIDToken } from 'src/app/core/models/id-token.model';

@Component({
  selector: 'app-all-features',
  templateUrl: './all-features.component.html',
  styleUrls: ['./all-features.component.scss']
})
export class AllFeaturesComponent implements OnInit {
  currentUser:AccountInfo;
  features:Feature[];

  constructor(
    private featureService:FeatureService, 
    private loadingService:LoadingService,
    private stateService:StateService, 
    private router:Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.stateService.getCurrentUser();
    if (this.currentUser != null){
      this.loadingService.incrementLoading("Retrieving features");
      this.featureService.getAllFeatures().toPromise().then(features=>{
        console.log("features:", features);
        this.features = features;
        this.loadingService.decrementLoading();
      });
    }
  }

  openFeature(featureName:string):void{
    this.router.navigate(['/feature/' + featureName]);
  }


}
