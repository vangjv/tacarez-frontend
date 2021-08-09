import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountInfo } from '@azure/msal-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { Revision } from 'src/app/core/models/revision.model';
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
  constructor(private confirmationService: ConfirmationService,  private messageService: MessageService,
    private stateService:StateService, private revisionService:RevisionsService, private loadingService:LoadingService,
    private router:Router ) {}

  
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

  openRevision(featureName:string, revisionName:string):void{
    this.router.navigate(['/revision/' + featureName + "/" + revisionName]);
  }

  showModalDialog() {
    this.displayModal = true;
  }

}
