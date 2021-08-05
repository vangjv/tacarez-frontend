import { Component, OnInit} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Role {
  name: string
}

@Component({
  selector: 'app-merge-request',
  templateUrl: './merge-request.component.html',
  styleUrls: ['./merge-request.component.scss']
})
export class MergeRequestComponent implements OnInit {


  // [(visible)]="displayStakeholderRev" 
  displayStakeholderRev: boolean = false;

  // [(visible)]="approveMerge" 
  approveMerge: boolean = false;

  showApprove() {
      this.approveMerge = true;
  }

  showStakeholder() {
    this.displayStakeholderRev = true;
}

  mergeReq = [
    {
      requester: 'John Smith',
      comments: 'New Evidence',
      roles: ''
    },
    {
      requester: 'Harry Potter',
      comments: 'Evidence from locals',
      role: ''
    },
  ]

  pendingMerge = [
    {
      requester: 'Luke Skywalker',
      comments: 'New Evidence',
      status: 'In Progress'
    },
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

//Roles
roles: Role[];
selectedRoles: Role;

//For CheckBoxes in Modal: Add Preview, Allow Revision
selectedValues: string[] = [];

  constructor(
    private confirmationService: ConfirmationService, 
    private messageService: MessageService
    ) { 
      this.roles = [
        {name: 'Signer'},
        {name: '--'},
      ];
      }

  ngOnInit(): void {
  }


}
