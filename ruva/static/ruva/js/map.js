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
        // Define styles
        this.initStyles();
        // Initialize layers and map
        this.initLayers();
        this.map = new ol.Map({
            target: conf['targetId'],
            layers: [
                this.assetLayer,
                this.osmLayer,
            ],
            view: this.initView(),
        });
        // Interactions
        var selectAssetInteraction = new ol.interaction.Select({
            condition: ol.events.condition.click,
            layers: [this.assetLayer],
            style: this.highlightedAssetStyle
          });
        this.map.addInteraction(selectAssetInteraction);
        selectAssetInteraction.on('select', function(e) {
            console.log(e.selected[0])
        });
    }

    initStyles() {
        this.assetStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({
                    color: '#ff0000'
                })
            })
        })
        this.highlightedAssetStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        })
    }

    initView() {
        return new ol.View({
            center: ol.proj.fromLonLat(this.conf['initCenter'] || [0, 0]),
            zoom: this.conf['initZoom'] || 4,
            projection: 'EPSG:3857',
        })
    }

    initLayers() {
        this.osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            zIndex: 0,
        })
        this.assetLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                projection: 'EPSG:3857'
            }),
            zIndex: 1,
            style: this.assetStyle
        });
    }

    updateLayerFromGeoJson(geojson) {
        this.assetLayer.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}));
    }

    highlightAssetFeatures(attrName, attrValue) {
        let features = this.assetLayer.getSource().getFeatures();
        for (const feature of features) {
            if (feature.get(attrName) == attrValue) {
                feature.setStyle(this.highlightedAssetStyle);
            } else {
                feature.setStyle(this.assetStyle);
            }
        }
    }

}