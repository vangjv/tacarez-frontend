import { Injectable } from '@angular/core';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { arcgisToGeoJSON } from "@terraformer/arcgis"
@Injectable({
  providedIn: 'root'
})
export class GeoJsonHelperService {

  constructor() { }

  createPointGeoJSONLayer(url):GeoJSONLayer{
    return new GeoJSONLayer({
      url: url,
      geometryType:"point",
      templates: [
        {
          name: "Feature",
          description: "New feature",
          drawingTool: "point",
          prototype: {
            attributes: {
              name:null,
              description: null,
              date: null,
              otherInformation: null
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
                fieldName: "description",
                label: "Description"
              },
              {
                fieldName: "date",
                label: "Date"
              },
              {
                fieldName: "otherInformation",
                label: "Other information"
              }
            ]
          }
        ]
      },
      //renderer: renderer //optional
    });
  }

  async createBlankPointGeoJsonLayer():Promise<GeoJSONLayer>{
    const geojsonLayer:GeoJSONLayer = this.createPointGeoJSONLayer("https://raw.githubusercontent.com/vangjv/geojsonexample/main/singlepoint.geojson");
    await geojsonLayer.queryFeatures().then(features=>{ 
      let deleteFeature =  features.features;
      geojsonLayer.applyEdits({
        deleteFeatures: deleteFeature
      });
    });
    return geojsonLayer;
  }

  loadGeoJSONLayer(url):GeoJSONLayer{
    return new GeoJSONLayer({
      url: url,
      // geometryType:"point",
      templates: [
        {
          name: "Feature",
          description: "New feature",
          // drawingTool: "point",
          prototype: {
            attributes: {
              name:null,
              description: null,
              date: null,
              otherInformation: null
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
                fieldName: "description",
                label: "Description"
              },
              {
                fieldName: "date",
                label: "Date"
              },
              {
                fieldName: "otherInformation",
                label: "Other information"
              }
            ]
          }
        ]
      },
      //renderer: renderer //optional
    });
  }

  getGeoJsonFromLayer(geojsonLayer:GeoJSONLayer){
    let featureCollection = {
      type: "FeatureCollection",
      features: []
    };    
    return geojsonLayer.queryFeatures().then(({ features }) => {      
      featureCollection.features = features.map(
        ({ attributes, geometry }, index) => {
          return {
            // id: index,
            properties: this.removeObjectIdAndReplaceNull(attributes),
            geometry: arcgisToGeoJSON(geometry),
            type:"Feature"
          };
        }
      );
      return featureCollection;
    })
    .catch(error => console.warn(error));  
  }

  removeObjectIdAndReplaceNull(attributes:any) {
    if (attributes["OBJECTID"]) {
      delete attributes.OBJECTID;
    }
    if (attributes["date"] == null || attributes["date"] == undefined) {
      attributes.date = "";
    }
    if (attributes["description"] == null || attributes["description"] == undefined) {
      attributes.description = "";
    }
    if (attributes["otherInformation"] == null || attributes["otherInformation"] == undefined) {
      attributes.otherInformation = "";
    }
    return attributes;
  }
}
