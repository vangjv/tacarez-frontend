import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.scss']
})
export class LogOutComponent implements OnInit {

  constructor(private authService: MsalService) {
    console.log('LOGOUT');

  }

  ngOnInit(): void {
    this.authService.logoutRedirect({
        // If in iframe, dont perform redirect to AAD
        onRedirectNavigate: () => {
            return !BrowserUtils.isInIframe();
        }
    });
  }
}
