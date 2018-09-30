const PubSub = require('../helpers/pub_sub');
const LatLon = require('../helpers/lat_lon');
const Request = require('../helpers/request');


const Location = function(latLon, offsetDistance){

    this.latLon = latLon;
    this.offsetDistance = offsetDistance;
    this.boundingRect = null;
    this.rows = 32;
    this.cols = 32;

    this.place = null;

};

Location.prototype.bindEvents = function(){

    PubSub.subscribe('MapWrapper:location-selected', (event) => {

        this.latLon = event.detail;
        this.getBoundingRect();
        this.getElevationData();
        this.setLocation();

    });

    PubSub.subscribe('PlacesView:place-selected', (event) =>{

        this.place = event.detail;
        this.setPlace();

    });

    PubSub.subscribe('AreaControls:area-width-change', (event) => {

        this.offsetDistance = event.detail;
        this.getBoundingRect();
        this.getElevationData();
        this.setLocation();

    });
};

Location.prototype.setPlace = function(){


    const placeJSONFile = this.place[4];

    const placeRequestURL = "./data/" + placeJSONFile;

    const placeRequest = new Request(placeRequestURL);
    placeRequest.get()
        .then((response) => {

            const coords = response.latlng;
            this.latLon = new LatLon(coords[0], coords[1]);
            this.offsetDistance = response.areaWidth;

            const zScale = response.elevationScale;
            PubSub.publish('Location:z-scale-set', zScale);


            const elevationData = {
                elevations: response.elevations,
                zoomLevel: response.zoom
            };

            // const sW = new LatLon(response.boundingRect.sw.lat, response.boundingRect.sw.lng);
            // const sE = new LatLon(response.boundingRect.se.lat, response.boundingRect.se.lng);
            // const nE = new LatLon(response.boundingRect.ne.lat, response.boundingRect.ne.lng);
            // const nW = new LatLon(response.boundingRect.nw.lat, response.boundingRect.nw.lng);
            //
            // this.boundingRect = {
            //     sw: sW,
            //     se: sE,
            //     ne: nE,
            //     nw: nW
            // };



            PubSub.publish('Location:elevations-available', elevationData);

            this.getBoundingRect();
            this.setLocation();


        })
        .catch((error) => {
            console.error(error);
        });


};

Location.prototype.getElevationData = function(){

    const sW = this.boundingRect.sw;
    const nE = this.boundingRect.ne;

    // A bounding box defined as a set of WGS84 latitudes and longitudes in the following order:
    // south latitude, west longitude, north latitude, east longitude
    // bounds=45.219,-122.234,47.61,-122.07

    const requestParameters = {
        route: 'Bounds',
        parameters : {
            bounds: `${sW.lat},${sW.lng},${nE.lat},${nE.lng}`,
            rows: this.rows,
            cols: this.cols,
            heights: 'sealevel'
        }
    };

    PubSub.publish('Location:request-elevation-data', [requestParameters, this.place]);

};

Location.prototype.getBoundingRect = function(){

    const north = this.latLon.destinationPoint(this.offsetDistance, 0);
    const east = this.latLon.destinationPoint(this.offsetDistance, 90);
    const south = this.latLon.destinationPoint(this.offsetDistance, 180);
    const west = this.latLon.destinationPoint(this.offsetDistance, 270);

    const sW = new LatLon(south.lat, west.lng);
    const sE = new LatLon(south.lat, east.lng);
    const nE = new LatLon(north.lat, east.lng);
    const nW = new LatLon(north.lat, west.lng);

    this.boundingRect = {
        sw: sW,
        se: sE,
        ne: nE,
        nw: nW
    };

    PubSub.publish('Location:bounding-rect-set', this.boundingRect);

};

Location.prototype.setLocation = function(){

    PubSub.publish('Location:location-set', this.latLon);
    PubSub.publish('Location:area-width-set', this.offsetDistance);

};

module.exports = Location;
