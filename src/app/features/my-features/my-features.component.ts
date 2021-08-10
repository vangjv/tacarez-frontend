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
import { StakeholdersService } from 'src/app/core/services/stakeholders.service';
import { User } from 'src/app/core/models/user.model';
import { ContributorsService } from 'src/app/core/services/contributors.service';

@Component({
  selector: 'app-my-features',
  templateUrl: './my-features.component.html',
  styleUrls: ['./my-features.component.scss']
})
export class MyFeaturesComponent implements OnInit {
  displayModal: boolean;
  display: boolean = false;
  contributorDisplay: boolean = false;
  currentUser:AccountInfo;
  features:Feature[];
  stakeholderForm: FormGroup;
  contributorForm: FormGroup;
  selectedFeature: Feature;
  saving: boolean = false;

  constructor(
    private confirmationService: ConfirmationService, 
    private messageService: MessageService,
    private stateService:StateService, 
    private featureService:FeatureService, 
    private loadingService:LoadingService,
    private router:Router,
    private stakeholdersService:StakeholdersService,
    private contributorsService:ContributorsService
    ) {}

  
  ngOnInit(): void {
    this.currentUser = this.stateService.getCurrentUser();
    if (this.currentUser != null){
      this.loadingService.incrementLoading("Retrieving features");
      this.featureService.getFeaturesByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(features=>{
        console.log("features:", features);
        this.features = features;
        this.loadingService.decrementLoading();
      }, err=>{
        console.log('err:', err);
        this.loadingService.decrementLoading();
        if(err.error == "No features found for that user") {
          this.features = [];
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while retrieving your features.  Please try another name.'});
        }
      });
    }

    this.createFormGroup();
    this.createContributorFormGroup();
  }



//FormGroup Stakeholder
  createFormGroup(){
    this.stakeholderForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required])
    });
  }

// open up Stakeholder modal
  showStakeholderDialog(feature:Feature) {
      this.display = true;
      this.selectedFeature = feature;
      console.log(this.selectedFeature);
  }


//PUT for stakeholder
  addStakeholder(){
    this.saving = true;
    let stakeholderList = this.selectedFeature.stakeholders || [];
    let addStakeholder = new User();
    addStakeholder.firstName = this.stakeholderForm.value.firstName;
    addStakeholder.lastName = this.stakeholderForm.value.lastName;
    addStakeholder.email = this.stakeholderForm.value.email;
    stakeholderList.push(addStakeholder);
    this.stakeholdersService.updateStakeholder(stakeholderList, this.selectedFeature.id).toPromise().then(sh=>{
      console.log("added a stakeholder:", sh);
      this.stakeholderForm.reset();
      // this.refreshStakeholdersAndSelectedFeatures();
      this.saving = false;
    });
  }

// Refresh stakeholder after being added
  refreshStakeholdersAndSelectedFeatures(){
    this.loadingService.incrementLoading("Retrieving features");
    this.featureService.getFeaturesByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(features=>{
      console.log("features:", features);
      this.features = features;
      this.loadingService.decrementLoading();
    });
    this.features.forEach(feature=>{
      if (feature.id == this.selectedFeature.id) {
        this.selectedFeature = feature;
      }
    })

  }

// DELETE stakeholders
  deleteStakeholder(index){
    this.selectedFeature.stakeholders.splice(index,1);
    this.stakeholdersService.updateStakeholder(this.selectedFeature.stakeholders, this.selectedFeature.id).toPromise().then(sh=>{
      console.log("delete a stakeholder:", sh);
      this.stakeholderForm.reset();
    });
    console.log(this.selectedFeature.stakeholders[index])
  }



  ///////////////////////////////////

// open up Contributor modal
showContributorDialog(feature:Feature) {
  this.contributorDisplay = true;
  this.selectedFeature = feature;
  console.log(this.selectedFeature);
}

//FormGroup Contributor
  createContributorFormGroup(){
    this.contributorForm = new FormGroup({
      email: new FormControl(null, [Validators.required])
    });
  }

//PUT for Contributor
  addContributor(){
    this.saving = true;
    let contributorList = this.selectedFeature.contributors || [];
    let addContributor = new User();
    addContributor.email = this.contributorForm.value.email;

    contributorList.push(addContributor);
    this.contributorsService.updateContributor(contributorList, this.selectedFeature.id).toPromise().then(con=>{
      console.log("added a contributor:", con);
      this.contributorForm.reset();
      // this.refreshStakeholdersAndSelectedFeatures();
      this.saving = false;
    });
  }

// Refresh stakeholder after being added
  refreshContributorAndSelectedFeatures(){
    this.loadingService.incrementLoading("Retrieving features");
    this.featureService.getFeaturesByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(features=>{
      console.log("features:", features);
      this.features = features;
      this.loadingService.decrementLoading();
    });
    this.features.forEach(feature=>{
      if (feature.id == this.selectedFeature.id) {
        this.selectedFeature = feature;
      }
    })

  }

// DELETE stakeholders
  deleteContributors(index){
    this.selectedFeature.contributors.splice(index,1);
    this.contributorsService.updateContributor(this.selectedFeature.contributors, this.selectedFeature.id).toPromise().then(con=>{
      console.log("delete a contributor:", con);
      this.contributorForm.reset();
    });
    console.log(this.selectedFeature.contributors[index])
  }




//////////////////////////////////////


  openFeature(featureName:string):void{
    this.router.navigate(['/feature/' + featureName]);
  }

  showModalDialog() {
    this.displayModal = true;
  }











}
