import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { MergeRequestRequest } from 'src/app/core/models/merge-request-request.model';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
import { Revision } from 'src/app/core/models/revision.model';
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
  constructor(private confirmationService: ConfirmationService,  private messageService: MessageService,
    private stateService:StateService, private loadingService:LoadingService,
    private router:Router, private mergeService:MergeService ) {}

  
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
}
