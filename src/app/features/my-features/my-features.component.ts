import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';




@Component({
  selector: 'app-my-features',
  templateUrl: './my-features.component.html',
  styleUrls: ['./my-features.component.scss']
})
export class MyFeaturesComponent implements OnInit {

  displayModal: boolean;

  // [(visible)]="display" 
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




  constructor(
    private confirmationService: ConfirmationService, 
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
  }

  showModalDialog() {
    this.displayModal = true;
  }


}
