'use strict';

console.log('map.js');

/**
 * Configuration options:
 * targetId: 'map'
 * initZoom: 4
 * initCenter: [0, 0]
 *
 */
class OLMapWrapper {
    constructor(conf) {
        this.conf = conf;
        // init layers
        this.osmLayer = this.initOsmLayer();
        this.assetLayer = this.initVectorLayer();
        // init map
        this.map = new ol.Map({
            target: conf['targetId'],
            layers: [
                this.assetLayer,
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

    updateLayerFromGeoJson(geojson) {
        this.assetLayer.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}));
    }

}