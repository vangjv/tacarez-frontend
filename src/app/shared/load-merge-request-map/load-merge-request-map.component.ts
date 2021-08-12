import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
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
import { LoadingService } from 'src/app/core/loadingspinner/loading-spinner/loading.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MsalService } from '@azure/msal-angular';
import { GitHubUser, UpdateFeatureRequest } from 'src/app/core/models/update-feature-request.model';
import { MergeRequest } from 'src/app/core/models/merge-request.model';
import Swipe from '@arcgis/core/widgets/Swipe';
import { MergeService } from 'src/app/core/services/merge.service';
import Compass from '@arcgis/core/widgets/Compass';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from "@arcgis/core/widgets/Legend";

@Component({
  selector: 'app-load-merge-request-map',
  templateUrl: './load-merge-request-map.component.html',
  styleUrls: ['./load-merge-request-map.component.css']
})

export class LoadMergeRequestMap implements OnInit {
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @Input() featureName:string;
  @Input() mergeRequest:MergeRequest;
  @Input() geojsonLayer:GeoJSONLayer;
  @Input() featuregeojsonLayer:GeoJSONLayer;
  @Input() isOwnerOrContributor:boolean = false;
  map: WebMap;
  mapView: MapView;
  saveMapDialog: boolean = false;  
  showShareFeatureDialog: boolean = false;
  showGetDataDialog:boolean = false;
  saveMapForm:FormGroup;
  saving:boolean = false;
  geoJsonURL:string = "";
  mergeRequestURL:string = "";
  constructor(private geoJsonHelper:GeoJsonHelperService, private stateService:StateService, private mergeService:MergeService,
    private loadingService:LoadingService, private confirmationService: ConfirmationService, private messageService: MessageService,
    private authService: MsalService) { }

  ngOnInit() {

    //load geojson data
    if(this.geojsonLayer == null || this.geojsonLayer == undefined) {
      this.geoJsonHelper.createBlankPointGeoJsonLayer().then(geoJsonLayer=>{
        this.geojsonLayer = geoJsonLayer;
        this.initializeMap();
      });    
    }  else {
      this.saveMapForm = this.createSaveMapForm();
      this.initializeMap();
      //set geojsonurl
      this.geoJsonURL = "https://api.tacarez.com/api/geojsonmerge/" + this.featureName + "/" + this.mergeRequest.id;
      this.mergeRequestURL = "https://www.tacarez.com/mergerequest/" + this.featureName + "/" + this.mergeRequest.id;
      console.log("isOwnerOrContributor:", this.isOwnerOrContributor);
    }   
  }

  createSaveMapForm():FormGroup{
    return new FormGroup({
      notes: new FormControl(null, [Validators.required])
    });
  }


  initializeMap(){
    const mapProperties = {
      basemap: 'streets-navigation-vector',
      layers: [this.geojsonLayer, this.featuregeojsonLayer]
    };

    this.map = new WebMap(mapProperties);
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: [0.1278, 51.5074],
      zoom: 10,
      map: this.map
    };

    this.mapView = new MapView(mapViewProperties);
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
     //Legend widget
     const layerList = new LayerList({
      view: this.mapView,
      selectionEnabled:true,
      listItemCreatedFunction: (event)=> {
        const item = event.item;
        if (item.layer.type != "group") {
          // don't show legend twice
          item.panel = {
            content: "legend",
            open: false
          }
          // item.title = this.featureName;
        }
      }
    });

    let compass = new Compass({
      view: this.mapView
    });
    this.mapView.ui.add(compass, "top-left");

    this.mapView.ui.add(layerList, "top-right");

    //labels
    this.mapView.ui.add("mergeTitle", "bottom-right");
    this.mapView.ui.add("originalTitle", "bottom-left");
    
    // Swipe widget
    const swipe = new Swipe({
      leadingLayers: [this.featuregeojsonLayer],
      trailingLayers: [this.geojsonLayer],
      position: 50, // set position of widget to 35%
      view: this.mapView,
      dragLabel: "Drag slicer to compare current feature map on the left to the merge changes on the right."
    });
    // add the widget to the view
    this.mapView.ui.add(swipe);

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
    this.confirmationService.confirm({
      message: 'Saves changes while a stakeholder review is in progress will send the updates to all stakeholders.  Do you want to continue saving these changes?',
      accept: () => {
        //check for more than one map feature
        this.geojsonLayer.queryFeatures().then(features=>{ 
          if (features.features.length > 0) {
            this.saveMapDialog = true;
          } else {
            this.messageService.add({severity:'warn', summary: 'No features to save', detail: 'No features were detected on the map.  Please add a feature before attempting to save.'});
          }
        });
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
      this.mergeService.updateMergeRequest(updateFeatureRequest, this.mergeRequest.featureName, this.mergeRequest.id).toPromise().then(res=>{
        this.loadingService.decrementLoading();
        this.messageService.add({severity:'success', summary:'Success', detail:'The merge request was successfully updated.'});
        this.saveMapDialog = false;
        this.saving = false;
        this.saveMapForm.reset();
      }, err=>{
        this.loadingService.decrementLoading();
        console.log("Error while trying to update merge request:", err);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while saving your feature. Please try again.'});
        this.saving = false;
      });
    })
    .catch(error => console.warn(error));
  }

  copyGeoJsonURLToClipBoard(){
    this.copyTextToClipboard(this.geoJsonURL);
  }

  copyFeatureURLToClipBoard(){
    this.copyTextToClipboard(this.mergeRequestURL);
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