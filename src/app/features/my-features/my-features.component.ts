import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { Feature } from 'src/app/core/models/feature.model';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { FeatureService } from 'src/app/core/services/feature.service';
import { StateService } from 'src/app/core/services/state.service';

@Component({
  selector: 'app-my-features',
  templateUrl: './my-features.component.html',
  styleUrls: ['./my-features.component.scss']
})
export class MyFeaturesComponent implements OnInit {
  displayModal: boolean;
  display: boolean = false;
  currentUser:AccountInfo;
  features:Feature[];
  constructor(private confirmationService: ConfirmationService,  private messageService: MessageService,
    private stateService:StateService, private featureService:FeatureService, private loadingService:LoadingService,
    private router:Router ) {}

  
  ngOnInit(): void {
    this.currentUser = this.stateService.getCurrentUser();
    if (this.currentUser != null){
      this.loadingService.incrementLoading("Retrieving features");
      this.featureService.getFeaturesByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(features=>{
        console.log("features:", features);
        this.features = features;
        this.loadingService.decrementLoading();
      });
    }
  }


  showDialog() {
      this.display = true;
  }


  myFeat = [
    {
      name: 'Desforestation',
      description: 'Natural or human actions in the removal of forest',
      lastdatemodified: 'Aug.10.2021'
    },
    {
      name: 'Nest sightings',
      description: 'Location of Chimp nests',
      lastdatemodified: 'Aug.22.2021'
    },
    {
      name: 'Poachers observed',
      description: 'a person who illegally hunts game, fish, etc, on someone elses property',
      lastdatemodified: 'Aug.22.2021'
    },    {
      name: 'Expanded farmland',
      description: 'Increase in farmland',
      lastdatemodified: 'Aug.12.2021'
    }

  ]

// Stakeholder/Reviewer modal data
  reviewerData = [
    {
      name: 'James Bond',
      email: 'james.bond@gmail.com'
    },
    {
      name: 'Professor Xavier',
      email: 'prof.x@gmail.com'
    },
    {
      name: 'Bruce Wayne',
      email: 'bruce@gmail.com'
    },
    {
      name: 'Tony Stark',
      email: 't.stark@gmail.com'
    }
  ]

  openFeature(featureName:string):void{
    this.router.navigate(['/feature/' + featureName]);
  }

  showModalDialog() {
    this.displayModal = true;
  }


}
