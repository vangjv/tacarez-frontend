import { Component, OnInit } from '@angular/core';
import { MyFeatures } from 'src/app/models/myfeatures.model';

@Component({
  selector: 'app-my-features',
  templateUrl: './my-features.component.html',
  styleUrls: ['./my-features.component.scss']
})
export class MyFeaturesComponent implements OnInit {
  myfeat:MyFeatures[];

  constructor() { }

  ngOnInit(): void {
    
  }

}
