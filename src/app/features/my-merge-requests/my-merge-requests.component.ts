import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { MergeRequestRequest } from 'src/app/core/models/merge-request-request.model';
import { MergeRequest, StakeholderReview } from 'src/app/core/models/merge-request.model';
import { Revision } from 'src/app/core/models/revision.model';
import { User } from 'src/app/core/models/user.model';
import { ContributorsService } from 'src/app/core/services/contributors.service';
import { MergeService } from 'src/app/core/services/merge.service';
import { RevisionsService } from 'src/app/core/services/revisions.service';
import { StateService } from 'src/app/core/services/state.service';

@Component({
  selector: 'app-my-merge-requests',
  templateUrl: './my-merge-requests.component.html',
  styleUrls: ['./my-merge-requests.component.scss']
})
export class MyMergeRequestsComponent implements OnInit {
  displayModal: boolean;
  display: boolean = false;
  currentUser:AccountInfo;
  mergeRequests:MergeRequest[];
  selectedRevision:Revision;
  showMergeRequestDialog:boolean = false;
  mergeOptions:any[] = [{
    "name" : "Request merge",
    "value" : "Request merge"
  }];
  mergeNotes:string = "";
  requestingMerge:boolean = false;
  mergeSelection:string = "";
  showMergeNotesDialog:boolean = false;
  selectedMergeRequestNotes:string = "";
  showStakeholderReviewDialog:boolean = false;
  selectedMergeRequest:MergeRequest;
  envelopeRoles:any[] = [
    {
      "label":"Signer", "value" : "Signer"
    },
    {
      "label":"Receive Copy", "value" : "Receive Copy"
    }
  ]
  stakeholderForm: FormGroup;
  contributorForm: FormGroup;
  saving: boolean = false;
  contributorDisplay:boolean = false;;

  constructor(private confirmationService: ConfirmationService,  private messageService: MessageService,
    private stateService:StateService, private loadingService:LoadingService,
    private router:Router, private mergeService:MergeService, private contributorsService:ContributorsService ) {}

  
  ngOnInit(): void {
    this.currentUser = this.stateService.getCurrentUser();
    if (this.currentUser != null){
      this.loadingService.incrementLoading("Retrieving revisions");
      this.mergeService.getMergeRequestsByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(mergeRequests=>{
        console.log("mergeRequests:", mergeRequests);
        this.mergeRequests = mergeRequests;
        this.loadingService.decrementLoading();
      }, err=>{
        console.log('err:', err);
        this.loadingService.decrementLoading();
        this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while retrieving your revisions.  Please try another name.'});
      });
    }
    this.stakeholderForm = this.createStakeHolderForm();
    this.contributorForm = this.createContributorFormGroup();
  }

  createStakeHolderForm(){
    return new FormGroup({
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      role: new FormControl(null, [Validators.required])
    });
  }

  showDialog() {
      this.display = true;
  }

  reviewMergeMap(featureName:string, mergeId:string):void{
    this.router.navigate(['/mergerequest/' + featureName + "/" + mergeId]);
  }

  showModalDialog() {
    this.displayModal = true;
  }

  createMergeRequest(){
    this.requestingMerge = true;
    this.loadingService.incrementLoading("Submitting merge request");
    let mergeRequestRequest:MergeRequestRequest = new MergeRequestRequest(this.selectedRevision.featureName, this.selectedRevision.revisionName, this.mergeNotes);
    this.mergeService.createMergeRequest(mergeRequestRequest).toPromise().then(res=>{
      this.requestingMerge = false;
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'success', summary:'Success', detail:'Your merge request was successfully created and sent to the owner of the feature.'});
      this.showMergeRequestDialog = false;
      this.mergeSelection = null;
      this.mergeNotes = "";
    }, err=>{
      this.loadingService.decrementLoading();
      this.requestingMerge = false;
      this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while requesting your merge request.  Please try again.'});
    });

  }

  showMergeDialog(revision:Revision){
    this.selectedRevision = revision;
    this.showMergeRequestDialog = true;
  }

  openNotes(merge:MergeRequest){
    this.selectedMergeRequestNotes = merge.mergeRequesterNotes ?? "";
    this.showMergeNotesDialog = true;
  }

  openStakeHolderReviewDialog(mergeRequest:MergeRequest){
    this.selectedMergeRequest = mergeRequest;
    this.showStakeholderReviewDialog = true;
  }

  addStakeholder(){
    console.log("selectedMergeRequest", this.selectedMergeRequest);
    let newUser:User = {
      firstName:this.stakeholderForm.value.firstName,
      lastName:this.stakeholderForm.value.lastName,
      email:this.stakeholderForm.value.email,
      role:this.stakeholderForm.value.role
    };   
    if (this.selectedMergeRequest?.stakeholderReview == null || this.selectedMergeRequest?.stakeholderReview == undefined) {
      let stakeholderReview = new StakeholderReview();
      stakeholderReview.stakeholders = [newUser];
      this.selectedMergeRequest.stakeholderReview = stakeholderReview;
    } else {
      if (this.selectedMergeRequest?.stakeholderReview?.stakeholders == null || this.selectedMergeRequest?.stakeholderReview?.stakeholders == undefined) {
        this.selectedMergeRequest.stakeholderReview.stakeholders = [newUser];
      } else {
        this.selectedMergeRequest?.stakeholderReview?.stakeholders.push(newUser);
      }
    }  
    console.log("stakeHolders:", this.selectedMergeRequest.stakeholderReview.stakeholders)  ;
    this.stakeholderForm.reset();
  }
  
// open up Contributor modal
showContributorDialog(mergeRequest:MergeRequest) {
  this.contributorDisplay = true;
  this.selectedMergeRequest = mergeRequest;
}

//FormGroup Contributor
  createContributorFormGroup(){
    return  new FormGroup({
      email: new FormControl(null, [Validators.required])
    });
  }

//PUT for Contributor
  addContributor(){
    this.saving = true;
    if (this.selectedMergeRequest.contributors == null || this.selectedMergeRequest.contributors == undefined) {
      this.selectedMergeRequest.contributors = [];
    } 
    let addContributor = new User();
    addContributor.email = this.contributorForm.value.email;

    this.selectedMergeRequest.contributors.push(addContributor);
    this.contributorsService.updateMergeRequestContributors(this.selectedMergeRequest.contributors, this.selectedMergeRequest.featureName,
      this.selectedMergeRequest.id).toPromise().then(con=>{
      console.log("added a contributor:", con);
      this.contributorForm.reset();
      this.saving = false;
    });
  }

// DELETE stakeholders
  deleteContributors(index){
    this.selectedMergeRequest.contributors.splice(index,1);
    this.contributorsService.updateMergeRequestContributors(this.selectedMergeRequest.contributors, this.selectedMergeRequest.featureName,
      this.selectedMergeRequest.id).toPromise().then(con=>{
      this.contributorForm.reset();
    });
  }

  closeContributorDialog(){
    this.contributorForm.reset();
    this.contributorDisplay=false;this.contributorForm.reset();    
  }

  cancelStakeholderReview(){
    this.showStakeholderReviewDialog = false;
    this.contributorForm.reset();
  }

}
