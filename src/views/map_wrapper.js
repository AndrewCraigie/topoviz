const PubSub = require('../helpers/pub_sub');
const LatLon = require('../helpers/lat_lon');

const MapWrapper = function(container, latLon, zoom){

    this.container = container;
    this.latLon = latLon;
    this.zoom = zoom;
    this.boundingRect = null;

    this.geoJSONLayer = null;
    this.featureStyle = null;

    this.map = L.map(this.container);
    this.osmLayer = new L.TileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png");

    this.map.setView(this.latLon, this.zoom).addLayer(this.osmLayer);
    this.marker = L.marker(this.latLon).addTo(this.map);

};

MapWrapper.prototype.bindEvents = function(){

    this.map.on('click', this.mapClicked);
    this.map.on('zoomend', (event) => {
        this.zoom = this.map.getZoom();
    });

    PubSub.subscribe('Location:location-set', (event) => {
        this.latLon = event.detail;
        this.centerMap();
        this.setMarker();
    });

    PubSub.subscribe('Location:bounding-rect-set', (event) => {
        this.boundingRect = event.detail;
        this.drawBoundingRect();
    });

};

MapWrapper.prototype.getBoundingRectJSON = function(){

    const boundingRect = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [this.boundingRect.ne.lng, this.boundingRect.ne.lat],
                [this.boundingRect.nw.lng,  this.boundingRect.nw.lat],
                [this.boundingRect.sw.lng,  this.boundingRect.sw.lat],
                [this.boundingRect.se.lng, this.boundingRect.se.lat],
                [this.boundingRect.ne.lng, this.boundingRect.ne.lat]
            ]]
        }
    };

    const rectCorners = {
        "type": "FeatureCollection",
        "features": [


            {
                "type": "Feature",
                "properties": {
                    "name": "North East",
                    "marker-color": "#008000"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        this.boundingRect.ne.lng,
                        this.boundingRect.ne.lat

                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "North West",
                    "marker-color": "#008000"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        this.boundingRect.nw.lng,
                        this.boundingRect.nw.lat

                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "South West",
                    "marker-color": "#0000ff"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        this.boundingRect.sw.lng,
                        this.boundingRect.sw.lat

                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "South East",
                    "marker-color": "#0000ff"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        this.boundingRect.se.lng,
                        this.boundingRect.se.lat

                    ]
                }
            }

        ]
    };

    return boundingRect;

};

MapWrapper.prototype.drawBoundingRect = function(){


    this.featureStyle = {
        color: "#ff7800",
        weight: 5,
        opacity: 0.5,
        fillOpacity: 0.3
    };

    const boundRectJSON = this.getBoundingRectJSON();


    if (this.geoJSONLayer !== null) {
        this.map.removeLayer(this.geoJSONLayer);
    }

    const geoJSONLayer = L.geoJSON(boundRectJSON,
        this.featureStyle);

    this.geoJSONLayer = geoJSONLayer;

    geoJSONLayer.addTo(this.map);

    //this.map.fitBounds(this.geoJSONLayer.getBounds());

    this.map.fitBounds([
        [this.boundingRect.ne.lng, this.boundingRect.ne.lat],
        [this.boundingRect.nw.lng,  this.boundingRect.nw.lat],
        [this.boundingRect.sw.lng,  this.boundingRect.sw.lat],
        [this.boundingRect.se.lng, this.boundingRect.se.lat]
    ])

    this.map.invalidateSize();


};

MapWrapper.prototype.centerMap = function(){


    this.map.setView(this.latLon, this.zoom);


};

MapWrapper.prototype.setMarker = function(){

    this.marker.remove();
    this.marker = L.marker(this.latLon).addTo(this.map);
    this.map.invalidateSize();
};

MapWrapper.prototype.mapClicked = function(event){

    const selectedLocation = new LatLon(event.latlng.lat, event.latlng.lng);
    PubSub.publish('MapWrapper:location-selected', selectedLocation);

};



module.exports = MapWrapper;
