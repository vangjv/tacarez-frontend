import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';


@Component({
  selector: 'app-my-features',
  templateUrl: './my-features.component.html',
  styleUrls: ['./my-features.component.scss']
})
export class MyFeaturesComponent implements OnInit {
  showReviewersModal: boolean = false;
  displayModal: boolean;

  display: boolean = false;

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

// modal data
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

  ]



  constructor(
    private ConfirmationService: ConfirmationService, 
    private messageServices: MessageService
  ) { }

  ngOnInit(): void {
  }

  // show Modal
  showReviewModal(){
    this.showReviewersModal = true;   
  }

  //Close out of Modal
  closeReviewersModal(){
    this.showReviewersModal = false;
  }


  //pop up to confirm add//
  confirmAdd(){
    this.ConfirmationService.confirm({
      message: 'Are you sure that you want to add?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageServices.add({severity: 'info', summary:'Confirmed', detail:'You have accepted'});
      },
      reject: (type) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            this.messageServices.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
          break;
          case ConfirmEventType.CANCEL:
              this.messageServices.add({severity:'warn', summary:'Cancelled', detail:'You have cancelled'});
          break;
        }
      }

    });
  }


  showModalDialog() {
    this.displayModal = true;
}

}
