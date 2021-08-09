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
import { StateService } from 'src/app/core/services/state.service';
import { OIDToken } from 'src/app/core/models/id-token.model';
import { User } from 'src/app/core/models/user.model';
import { FeatureService } from 'src/app/core/services/feature.service';
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MsalService } from '@azure/msal-angular';
import { GitHubUser, UpdateFeatureRequest } from 'src/app/core/models/update-feature-request.model';
import { NewRevisionRequest } from 'src/app/core/models/new-revision-request.model';
import { RevisionsService } from 'src/app/core/services/revisions.service';
import Compass from '@arcgis/core/widgets/Compass';

@Component({
  selector: 'app-load-revision-map',
  templateUrl: './load-revision-map.component.html',
  styleUrls: ['./load-revision-map.component.css']
})

export class LoadRevisionMap implements OnInit {
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @Input() featureName:string;
  @Input() revisionName:string;
  @Input() geojsonLayer:GeoJSONLayer;
  @Input() isOwnerOrContributor:boolean = false;
  map: WebMap;
  mapView: MapView;
  showRevisionDialog: boolean = false;
  saveMapDialog: boolean = false;  
  showShareFeatureDialog: boolean = false;
  showGetDataDialog:boolean = false;
  saveMapForm:FormGroup;
  revisionForm:FormGroup;
  saving:boolean = false;
  geoJsonURL:string = "";
  revisionURL:string = "";
  constructor(private geoJsonHelper:GeoJsonHelperService, private stateService:StateService, private featureService:FeatureService,
    private loadingService:LoadingService, private confirmationService: ConfirmationService, private messageService: MessageService,
    private authService: MsalService, private revisionService:RevisionsService) { }

  ngOnInit() {
    //load geojson data
    if(this.geojsonLayer == null || this.geojsonLayer == undefined) {
      this.geoJsonHelper.createBlankPointGeoJsonLayer().then(geoJsonLayer=>{
        this.geojsonLayer = geoJsonLayer;
        this.initializeMap();
      });    
    }  else {
      this.saveMapForm = this.createSaveMapForm();
      this.revisionForm = this.createRevisionForm();
      this.initializeMap();
      //set geojsonurl
      this.geoJsonURL = "https://api.tacarez.com/api/geojson/" + this.featureName + "/" + this.revisionName;
      this.revisionURL = "https://www.tacarez.com/revision/" + this.featureName + "/" + this.revisionName;;
      console.log("isOwnerOrContributor:", this.isOwnerOrContributor);
    }   
  }

  createSaveMapForm():FormGroup{
    return new FormGroup({
      notes: new FormControl(null, [Validators.required])
    });
  }

  createRevisionForm():FormGroup{
    return new FormGroup({
      revisionName: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required])
    });
  }

  createRevision(){
    let currentUser = this.stateService.getCurrentUser();   
    this.saving = true;
    this.loadingService.incrementLoading("Creating revision...");
    let newRevisionRequest:NewRevisionRequest = new NewRevisionRequest();
    let oidClaims:OIDToken = currentUser?.idTokenClaims as OIDToken;    
    let owner = new User();
    owner.email = oidClaims.emails[0];
    owner.firstName = oidClaims.given_name;
    owner.lastName = oidClaims.family_name;
    owner.guid = oidClaims.oid;
    newRevisionRequest.Owner = owner;
    newRevisionRequest.featureName = this.featureName;
    newRevisionRequest.revisionName = this.revisionForm.value.revisionName; 
    newRevisionRequest.description = this.revisionForm.value.description; 
    this.revisionService.createRevision(newRevisionRequest).toPromise().then(res=>{
      console.log("response from new revision request:", res);
      this.loadingService.decrementLoading();
      this.messageService.add({severity:'success', summary:'Success', detail:'Your revision was successfully created.'});
      this.showRevisionDialog = false;
      this.saving = false;
      this.revisionForm.reset();
    }, err=>{
      this.saving = false;
      this.loadingService.decrementLoading();
      console.log("Error from new revision request:", err);
      this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while trying to create your revision. Please try again.'});      
    });
  }

  initializeMap(){
    const mapProperties = {
      basemap: 'streets-navigation-vector',
      layers: [this.geojsonLayer]
    };

    this.map = new WebMap(mapProperties);
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: [0.1278, 51.5074],
      zoom: 10,
      map: this.map
    };

    this.mapView = new MapView(mapViewProperties);

    let compass = new Compass({
      view: this.mapView
    });
    this.mapView.ui.add(compass, "top-left");

    this.addSideButtons(this.mapView);
    
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
      view:this.mapView,
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
      this.mapView.ui.add(editor, "top-right");
    }

    this.mapView.when(() => {
      const typeParams = {
        layer: this.geojsonLayer,
        view: this.mapView,
        field: "name"
      };
      return typeCreator.createRenderer(typeParams).then(response => {
        this.geojsonLayer.renderer = response.renderer;
        return this.geojsonLayer.queryFeatures();
      });
    })
    .then(({ features }) => {
      this.mapView.goTo(features);
    })
    .catch(error => {
      console.warn(error);
    }).finally(()=>{
    });  
  }

  showRevision(){
    this.showRevisionDialog = true;
  }

  addSideButtons(mapView:MapView){
    let shareFeatureBtn = document.getElementById("shareFeature");
    mapView.ui.add(shareFeatureBtn, "top-left");
    shareFeatureBtn.addEventListener("click", () => {
      this.showShareFeatureDialog = true;
    });

    let getDataBtn = document.getElementById("getData");
    mapView.ui.add(getDataBtn, "top-left");
    getDataBtn.addEventListener("click", () => {
      this.showGetDataDialog = true;
    });

    let saveFeatureBtn = document.getElementById("saveFeature");
    if (this.isOwnerOrContributor == true) {
      mapView.ui.add(saveFeatureBtn, "top-left");
      saveFeatureBtn.addEventListener("click", () => {
        this.showSaveMap();      
      });
    }
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

  saveChanges(){
    let currentUser = this.stateService.getCurrentUser();   
    this.saving = true;
    this.loadingService.incrementLoading("Saving...");
    this.geoJsonHelper.getGeoJsonFromLayer(this.geojsonLayer).then(FeatureCollection=> {
      let encodedGeoJson = btoa(JSON.stringify(FeatureCollection));
      let updateFeatureRequest:UpdateFeatureRequest = new UpdateFeatureRequest();
      let committer:GitHubUser = new GitHubUser();
      let oidClaims:OIDToken = currentUser.idTokenClaims as OIDToken;  
      committer.email = oidClaims.emails[0];
      committer.name = oidClaims.name;
      committer.date = new Date().toDateString();
      updateFeatureRequest.committer = committer;
      updateFeatureRequest.content = encodedGeoJson;
      updateFeatureRequest.message = this.saveMapForm.value.notes;
      this.featureService.updateFeature(updateFeatureRequest, this.featureName, this.revisionName).toPromise().then(res=>{
        this.loadingService.decrementLoading();
        this.messageService.add({severity:'success', summary:'Success', detail:'Your feature was successfully updated.'});
        this.saveMapDialog = false;
        this.saving = false;
        this.saveMapForm.reset();
      }, err=>{
        this.loadingService.decrementLoading();
        console.log("Error from new feature request:", err);
        if (err.error == "A feature with that name already exist") {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'A feature with that name already exist.  Please try another name.'});
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while saving your feature. Please try again.'});
        }
        this.saving = false;
      });
    })
    .catch(error => console.warn(error));
  }

  copyGeoJsonURLToClipBoard(){
    this.copyTextToClipboard(this.geoJsonURL);
  }

  copyFeatureURLToClipBoard(){
    this.copyTextToClipboard(this.revisionURL);
  }

  fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      this.messageService.add({severity:'success', summary:'Success', detail:'URL Copied to clipboard'});
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  
  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(()=> {
      this.messageService.add({severity:'success', summary:'Success', detail:'URL Copied to clipboard'});
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

}
