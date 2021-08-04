import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppMainComponent } from './app.main.component';
import { HomeComponent } from './features/home/home.component';
import { NewFeatureComponent } from './features/new-feature/new-feature.component';
import { MyFeaturesComponent } from './features/my-features/my-features.component';
import { MergeRequestComponent } from './features/merge-request/merge-request.component';

const routes: Routes = [
  {
    path: '', component: AppMainComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'new', component: NewFeatureComponent},
      {path: 'myfeatures', component: MyFeaturesComponent},
      {path: 'mergerequest', component: MergeRequestComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
