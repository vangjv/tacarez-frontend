import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { arcgisToGeoJSON } from "@terraformer/arcgis"
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Editor from '@arcgis/core/widgets/Editor';
import * as typeCreator from '@arcgis/core/renderers/smartMapping/creators/type';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FieldConfig from '@arcgis/core/widgets/FeatureForm/FieldConfig';
import Renderer from '@arcgis/core/renderers/Renderer';
import Sketch from '@arcgis/core/widgets/Sketch';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})

export class EsriMapComponent implements OnInit {

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;

  constructor() { }

  ngOnInit() {

    const url = "https://raw.githubusercontent.com/vangjv/geojsonexample/newevidence/feature.geojson";

    // const renderer:Renderer = {
    //   type: "simple",
    //   field: "name",
    //   symbol: {
    //     type: "simple-marker",
    //     color: "orange",
    //     outline: {
    //       color: "white"
    //     }
    //   },
    //   visualVariables: [
    //     {
    //       type: "size",
    //       field: "name",
    //       stops: [
    //         {
    //           value: 2.5,
    //           size: "4px"
    //         },
    //         {
    //           value: 8,
    //           size: "40px"
    //         }
    //       ]
    //     }
    //   ]
    // };

    const geojsonLayer:GeoJSONLayer = new GeoJSONLayer({
      url: url,
      templates: [
        {
          name: "Crashes",
          description: "Pedestrian crashes in Chapel Hill",
          drawingTool: "point",
          prototype: {
            attributes: {
              name: null,
              address: null,
              website: null,
              open1: null,
            }
          }
        }
      ],
      popupTemplate: {
        title: "{name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "name",
                label: "name"
              },
              {
                fieldName: "address",
                label: "address"
              },
              {
                fieldName: "website",
                label: "website"
              },
              {
                fieldName: "open1",
                label: "open1"
              }
            ]
          }
        ]
      },
      //renderer: renderer //optional
    });

    const mapProperties = {
      basemap: 'streets-navigation-vector',
      layers: [geojsonLayer]
    };

    const m: WebMap = new WebMap(mapProperties);

    // STEP 2: construct a typed MapView instance with typed constructor properties
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: [0.1278, 51.5074],
      zoom: 10,
      map: m
    };


    const mapView: MapView = new MapView(mapViewProperties);

    let fieldConfigName:FieldConfig = new FieldConfig( {
      name: "name",
      label: "name"
    });
    let fieldConfigAddress:FieldConfig = new FieldConfig( {
      name: "address",
      label: "address"
    });
    let fieldConfigWebsite:FieldConfig = new FieldConfig( {
      name: "website",
      label: "website"
    });
    let fieldConfigOpen:FieldConfig = new FieldConfig( {
      name: "open1",
      label: "open1"
    });
    const editor:Editor = new Editor({
      view:mapView,
      layerInfos: [
        {
          layer: (geojsonLayer as unknown as FeatureLayer),
          fieldConfig: [
            fieldConfigName,
            fieldConfigAddress,
            fieldConfigWebsite,
            fieldConfigOpen
          ]
        }
      ]
    });
    mapView.ui.add(editor, "top-right");

    mapView.when(() => {
      const typeParams = {
        layer: geojsonLayer,
        view: mapView,
        field: "name"
      };
      return typeCreator.createRenderer(typeParams).then(response => {
        geojsonLayer.renderer = response.renderer;
        return geojsonLayer.queryFeatures();
      });
    })
    .then(({ features }) => {
      mapView.goTo(features);
    })
    .catch(error => {
      console.warn(error);
    });
    
    const exportBtn = document.getElementById("export");
    mapView.ui.add(exportBtn, "top-left");

    mapView.when(() => {
      const sketch = new Sketch({
        layer: geojsonLayer,
        view: mapView,
        // graphic will be selected as soon as it is created
        creationMode: "update"
      });

      mapView.ui.add(sketch, "bottom-right");
    });

    exportBtn.addEventListener("click", () => {
      geojsonLayer
        .queryFeatures()
        .then(({ features }) => {
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
          // Do something with your GeoJSON
          // Download it or send it to an external API
          // to update your existing GeoJSON
          console.log("FeatureCollection", FeatureCollection);
        })
        .catch(error => console.warn(error));
    });


  }

  removeObjectId(attributes:any) {
    if (attributes["OBJECTID"]) {
      delete attributes.OBJECTID;
    }
    return attributes;
  }

}
