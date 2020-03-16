'use strict';

console.log('map.js');

var map;

$(document).ready(function() {
    map = new OLMap({
        'targetId': 'map',
        'initCenter': [0, 0],
        'initZoom': 4
    })
});


class OLMap {
    constructor(conf) {
        this.conf = conf;
        this.osmLayer = this.initOsmLayer();
        this.vectorLayer = this.initVectorLayer();
        this.map = new ol.Map({
            target: conf['targetId'],
            layers: [
                this.vectorLayer,
                this.osmLayer,
            ],
            view: this.initView(),
        });
    }

    initView() {
        return new ol.View({
            center: ol.proj.fromLonLat(this.conf['initCenter'] || [0, 0]),
            zoom: this.conf['initZoom'] || 4,
            projection: 'EPSG:3857',
        })
    }

    initOsmLayer() {
        return new ol.layer.Tile({
            source: new ol.source.OSM(),
            zIndex: 0,
        })
    }

    initVectorLayer() {
        return new ol.layer.Vector({
            source: new ol.source.Vector({
                projection: 'EPSG:3857'
            }),
            zIndex: 1,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 4,
                    fill: new ol.style.Fill({
                        color: '#ff0000'
                    })
                })
            })
        });
    }

    updateLayerFromTable(geojson) {
        this.vectorLayer.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}));
    }

}

  /*
var vectorLayerJSON = new ol.source.Vector({
    features: (new ol.format.GeoJSON()).readFeatures(table.ajax.json())
});
*/