import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppMainComponent } from './app.main.component';
import { HomeComponent } from './features/home/home.component';
import { NewFeatureComponent } from './features/new-feature/new-feature.component';
import { MyFeaturesComponent } from './features/my-features/my-features.component';
import { MergeRequestComponent } from './features/merge-request/merge-request.component';
import { LogOutComponent } from './features/log-out/log-out.component';
import { LoadFeatureComponent } from './features/load-feature/load-feature.component';
import { MyRevisionsComponent } from './features/my-revisions/my-revisions.component';
import { LoadRevisionComponent } from './features/load-revision/load-revision.component';
import { MyMergeRequestsComponent } from './features/my-merge-requests/my-merge-requests.component';
import { MsalGuard } from '@azure/msal-angular';
import { LoadMergeRequestComponent } from './features/load-merge-request/load-merge-request.component';

const routes: Routes = [
  {
    path: '', component: AppMainComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'new', component: NewFeatureComponent},
      {path: 'feature/:featureName', component: LoadFeatureComponent},
      {path: 'feature/:featureName/:hash', component: LoadFeatureComponent},
      {path: 'revision/:featureName/:revisionName', component: LoadRevisionComponent},
      {path: 'mergerequest/:featureName/:mergeId', component: LoadMergeRequestComponent},
      {path: 'feature',  redirectTo: ''},
      {
        path: 'myfeatures', 
        component: MyFeaturesComponent,
        canActivate: [MsalGuard]
      },
      {
        path: 'myrevisions', 
        component: MyRevisionsComponent,
        canActivate: [MsalGuard]
      },
      {
        path: 'mymergerequests', 
        component: MyMergeRequestsComponent,
        canActivate: [MsalGuard]
      },
      {
        path: 'mergerequest', 
        component: MergeRequestComponent,
        canActivate: [MsalGuard]
      }
    ]
  },
  {
    path: 'logout', 
    component: LogOutComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
