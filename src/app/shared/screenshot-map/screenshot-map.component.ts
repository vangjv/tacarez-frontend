import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import * as typeCreator from '@arcgis/core/renderers/smartMapping/creators/type';
import { GeoJsonHelperService } from 'src/app/core/services/geo-json-helper.service';
import { MergeRequest } from 'src/app/core/models/merge-request.model';

@Component({
  selector: 'screenshot-map',
  templateUrl: './screenshot-map.component.html',
  styleUrls: ['./screenshot-map.component.css']
})

export class ScreenShotMap implements OnInit {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @Input() featureName:string;
  @Input() mergeRequest:MergeRequest;
  @Input() geojsonLayer:GeoJSONLayer;
  @Input() isOwnerOrContributor:boolean = false;
  map: WebMap;
  mapView: MapView;
  mergeRequestURL:string = "";
  constructor(private geoJsonHelper:GeoJsonHelperService) { }

  ngOnInit() {
    //load geojson data
    if(this.geojsonLayer == null || this.geojsonLayer == undefined) {
      this.geoJsonHelper.createBlankPointGeoJsonLayer().then(geoJsonLayer=>{
        this.geojsonLayer = geoJsonLayer;
        this.initializeMap();
      });    
    }  else {
      this.initializeMap();
    }   
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
      map: this.map,
      ui: {
        components: ["attribution"]
      }
    };
    this.mapView = new MapView(mapViewProperties);

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

}
