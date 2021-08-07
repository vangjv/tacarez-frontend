import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { arcgisToGeoJSON } from "@terraformer/arcgis"
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Editor from '@arcgis/core/widgets/Editor';
import * as typeCreator from '@arcgis/core/renderers/smartMapping/creators/type';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FieldConfig from '@arcgis/core/widgets/FeatureForm/FieldConfig';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NewFeature, NewFeatureRequest } from 'src/app/core/models/new-feature-request.model';
import { StateService } from 'src/app/core/services/state.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { User } from 'src/app/core/models/user.model';
import { FeatureService } from 'src/app/core/services/feature.service';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-load-esri-map',
  templateUrl: './load-esri-map.component.html',
  styleUrls: ['./load-esri-map.component.css']
})

export class LoadEsriMapComponent implements OnInit {
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @Input() geojsonLayer:GeoJSONLayer;
  @Input() isOwnerOrContributor:boolean = false;
  mergeDialog: Boolean;
  saveMapDialog: Boolean;  
  saveMapForm:FormGroup
  saving:boolean = false;
  constructor(private geoJsonHelper:GeoJsonHelperService, private stateService:StateService, private featureService:FeatureService,
    private loadingService:LoadingService, private confirmationService: ConfirmationService, private messageService: MessageService,
    private authService: MsalService) { }

  ngOnInit() {
    //load geojson data
    if(this.geojsonLayer == null || this.geojsonLayer == undefined) {
      this.geoJsonHelper.createBlankPointGeoJsonLayer().then(geoJsonLayer=>{
        this.geojsonLayer = geoJsonLayer;
        this.initializeMap();
      });    
    }    
    this.saveMapForm = this.createSaveMapForm();
    this.initializeMap();
    console.log("isOwnerOrContributor:", this.isOwnerOrContributor);
  }

  createSaveMapForm():FormGroup{
    return new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z0-9 ]*')]),
      description: new FormControl(null, [Validators.required]),
      tags: new FormControl(null),
    });
  }

  initializeMap(){
    const mapProperties = {
      basemap: 'streets-navigation-vector',
      layers: [this.geojsonLayer]
    };

    const m: WebMap = new WebMap(mapProperties);
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: [0.1278, 51.5074],
      zoom: 10,
      map: m
    };

    const mapView: MapView = new MapView(mapViewProperties);
    let fieldConfigName:FieldConfig = new FieldConfig( {
      name: "name",
      label: "Name",
      editable: true,
      editorType: "text-box",
    });
    let fieldConfigDescription:FieldConfig = new FieldConfig( {
      name: "description",
      label: "Description",
      editable: true,
      editorType: "text-box",
    });
    let fieldConfigDate:FieldConfig = new FieldConfig( {
      name: "date",
      label: "Date",
      editable: true,
      editorType: "text-box",
    });
    let fieldConfigOther:FieldConfig = new FieldConfig( {
      name: "otherInformation",
      label: "Other information",
      editable: true,
      editorType: "text-box",
    });

    const editor:Editor = new Editor({
      view:mapView,
      layerInfos: [
        {
          layer: (this.geojsonLayer as unknown as FeatureLayer),
          fieldConfig: [
            fieldConfigName,
            fieldConfigDescription,
            fieldConfigDate,
            fieldConfigOther
          ],
          enabled: true,
          addEnabled: true,
          updateEnabled: true,
          deleteEnabled: true
        }
      ]
    });

    //add editor if map owner or contributor
    if (this.isOwnerOrContributor) {
      mapView.ui.add(editor, "top-right");
    }
    
    mapView.when(() => {
      const typeParams = {
        layer: this.geojsonLayer,
        view: mapView,
        field: "name"
      };
      return typeCreator.createRenderer(typeParams).then(response => {
        this.geojsonLayer.renderer = response.renderer;
        return this.geojsonLayer.queryFeatures();
      });
    })
    .then(({ features }) => {
      mapView.goTo(features);
    })
    .catch(error => {
      console.warn(error);
    });  

    const shareFeatureBtn = document.getElementById("shareFeature");
    mapView.ui.add(shareFeatureBtn, "top-left");
    shareFeatureBtn.addEventListener("click", () => {
      //share
    });

    const reviseFeatureBtn = document.getElementById("reviseFeature");
    mapView.ui.add(reviseFeatureBtn, "top-left");
    reviseFeatureBtn.addEventListener("click", () => {
      //share
    });

    const cloneFeatureBtn = document.getElementById("cloneFeature");
    mapView.ui.add(cloneFeatureBtn, "top-left");
    cloneFeatureBtn.addEventListener("click", () => {
      //share
    });

    const saveFeatureBtn = document.getElementById("saveFeature");
    if (this.isOwnerOrContributor == true) {
      mapView.ui.add(saveFeatureBtn, "top-left");
      saveFeatureBtn.addEventListener("click", () => {
        // this.showSaveMap();      
      });
    }
  }

  showMerge(){
    this.mergeDialog = true;
  }

  showSaveMap(){
    let currentUser = this.stateService.getCurrentUser();  
    console.log("currentUser:", currentUser);
    if (currentUser == null || currentUser == undefined) {
      this.confirmationService.confirm({
        header: "A TacarEZ account is required to save",
        message: 'You must be logged in to save a new map feature.  Would you like to sign in now?',
        accept: () => {
          this.authService.loginRedirect();
        }
      });
      return;
    }
    //check for more than one map feature
    this.geojsonLayer.queryFeatures().then(features=>{ 
      if (features.features.length > 0) {
        this.saveMapDialog = true;
      } else {
        this.messageService.add({severity:'warn', summary: 'No features to save', detail: 'No features were detected on the map.  Please add a feature before attempting to save.'});
      }
    });
    
  }

  removeObjectId(attributes:any) {
    if (attributes["OBJECTID"]) {
      delete attributes.OBJECTID;
    }
    return attributes;
  }

  saveMapFeature(){
    let currentUser = this.stateService.getCurrentUser();   
    this.saving = true;
    this.loadingService.incrementLoading("Saving...");
    this.geojsonLayer.queryFeatures().then(({ features }) => {
      const FeatureCollection = {
        type: "FeatureCollection",
        features: []
      };
      FeatureCollection.features = features.map(
        ({ attributes, geometry }, index) => {
          return {
            // id: index,
            properties: this.removeObjectId(attributes),
            geometry: arcgisToGeoJSON(geometry),
            type:"Feature"
          };
        }
      );
      let encodedGeoJson = btoa(JSON.stringify(FeatureCollection));
      let newFeature:NewFeature = new NewFeature();
      let mapOwner = new User();      
      let oidClaims:OIDToken = currentUser.idTokenClaims as OIDToken;
      mapOwner.email = oidClaims.emails[0];
      mapOwner.firstName = oidClaims.given_name;
      mapOwner.lastName = oidClaims.family_name;
      mapOwner.guid = oidClaims.oid;
      newFeature.Id = this.saveMapForm.value.name;
      newFeature.Description = this.saveMapForm.value.description;
      newFeature.Owner = mapOwner
      let newFeatureRequest:NewFeatureRequest = new NewFeatureRequest();
      newFeatureRequest.feature = newFeature;
      newFeatureRequest.message = "Initial map";
      newFeatureRequest.content = encodedGeoJson;
      this.featureService.createFeature(newFeatureRequest).toPromise().then(res=>{
        console.log("response from new features request:", res);
        this.loadingService.decrementLoading();
        //redirect to new map
        //redirect uri to res.id
      }, err=>{
        this.loadingService.decrementLoading();
        console.log("Error from new feature request:", err);
        if (err.error == "A feature with that name already exist") {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'A feature with that name already exist.  Please try another name.'});
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while saving your feature. Please try again.'});
        }
      });
    })
    .catch(error => console.warn(error));
  }

}
