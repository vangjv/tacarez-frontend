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
import { AllFeaturesComponent } from './features/all-features/all-features.component';

const routes: Routes = [
  {
    path: '', component: AppMainComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'new', component: NewFeatureComponent},
      {path: 'feature/:featureName', component: LoadFeatureComponent},
      {path: 'feature/:featureName/:hash', component: LoadFeatureComponent},
      {path: 'revision/:featureName/:revisionName', component: LoadRevisionComponent},
      {path: 'feature',  redirectTo: ''},
      {path: 'myfeatures', component: MyFeaturesComponent},
      {path: 'myrevisions', component: MyRevisionsComponent},
      {path: 'mergerequest', component: MergeRequestComponent},
      {path: 'explore', component: AllFeaturesComponent}
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
