import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { MergeRequestRequest } from 'src/app/core/models/merge-request-request.model';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
import { Revision } from 'src/app/core/models/revision.model';
import { User } from 'src/app/core/models/user.model';
import { ContributorsService } from 'src/app/core/services/contributors.service';
import { MergeService } from 'src/app/core/services/merge.service';
import { RevisionsService } from 'src/app/core/services/revisions.service';
import { StateService } from 'src/app/core/services/state.service';

@Component({
  selector: 'app-my-revisions',
  templateUrl: './my-revisions.component.html',
  styleUrls: ['./my-revisions.component.scss']
})
export class MyRevisionsComponent implements OnInit {
  displayModal: boolean;
  display: boolean = false;
  currentUser:AccountInfo;
  revisions:Revision[];
  selectedRevision:Revision;
  showMergeRequestDialog:boolean = false;
  mergeOptions:any[] = [{
    "name" : "Request merge",
    "value" : "Request merge"
  }];
  requestingMerge:boolean = false;
  mergeSelection:string = "";
  mergeNotes:string = "";
  contributorDisplay:boolean = false;
  saving:boolean = false;
  contributorForm:FormGroup;
  constructor(private confirmationService: ConfirmationService,  private messageService: MessageService,
    private stateService:StateService, private revisionService:RevisionsService, private loadingService:LoadingService,
    private router:Router, private mergeService:MergeService,  private contributorsService:ContributorsService ) {}

  
  ngOnInit(): void {
    this.currentUser = this.stateService.getCurrentUser();
    if (this.currentUser != null){
      this.loadingService.incrementLoading("Retrieving revisions");
      this.revisionService.getRevisionsByUser((this.currentUser?.idTokenClaims as OIDToken).oid).toPromise().then(revisions=>{
        console.log("revisions:", revisions);
        this.revisions = revisions;
        this.loadingService.decrementLoading();
      }, err=>{
        console.log('err:', err);
        this.loadingService.decrementLoading();
        if(err.error == "No revisions found for that user") {
          this.revisions = [];
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while retrieving your revisions.  Please try another name.'});
        }
      });
    }
    this.contributorForm = this.createContributorFormGroup();
  }

  showDialog() {
      this.display = true;
  }

  openRevision(featureName:string, revisionName:string):void{
    this.router.navigate(['/revision/' + featureName + "/" + revisionName]);
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

  createContributorFormGroup(){
    return new FormGroup({
      email: new FormControl(null, [Validators.required])
    });
  }

  //PUT for Contributor
  addContributor(){
    this.saving = true;
    if (this.selectedRevision.contributors == null || this.selectedRevision.contributors == undefined) {
      this.selectedRevision.contributors = [];
    } 
    let addContributor = new User();
    addContributor.email = this.contributorForm.value.email;

    this.selectedRevision.contributors.push(addContributor);
    this.contributorsService.updateRevisionContributors(this.selectedRevision.contributors, this.selectedRevision.featureName, 
      this.selectedRevision.revisionName).toPromise().then(con=>{
      console.log("added a contributor:", con);
      this.contributorForm.reset();
      this.saving = false;
    });
  }


// DELETE stakeholders
  deleteContributors(index){
    this.selectedRevision.contributors.splice(index,1);
    this.contributorsService.updateRevisionContributors(this.selectedRevision.contributors, this.selectedRevision.featureName, 
      this.selectedRevision.revisionName).toPromise().then(con=>{
      console.log("delete a contributor:", con);
      this.contributorForm.reset();
    });
  }

  closeContributorDialog(){
    this.contributorForm.reset();
    this.contributorDisplay=false;this.contributorForm.reset();    
  }

  // open up Contributor modal
  showContributorDialog(revision:Revision) {
    this.contributorDisplay = true;
    this.selectedRevision = revision;
  }



}
