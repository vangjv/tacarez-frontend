import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppMainComponent } from './app.main.component';
import { HomeComponent } from './features/home/home.component';
import { NewFeatureComponent } from './features/new-feature/new-feature.component';

const routes: Routes = [
  {
    path: '', component: AppMainComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'new', component: NewFeatureComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
