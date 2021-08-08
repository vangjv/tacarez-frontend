import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-my-revisions',
  templateUrl: './my-revisions.component.html',
  styleUrls: ['./my-revisions.component.scss']
})
export class MyRevisionsComponent implements OnInit {
  displayModal: boolean;
  display: boolean = false;
  constructor(
    private confirmationService: ConfirmationService, 
    private messageService: MessageService
  ) {}

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






  ngOnInit(): void {
  }

  showModalDialog() {
    this.displayModal = true;
  }


}
