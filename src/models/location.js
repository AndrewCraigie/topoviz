const PubSub = require('../helpers/pub_sub');
const LatLon = require('../helpers/lat_lon');


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

        const coords = this.place[1];

        this.latLon = new LatLon(coords[0], coords[1]);
        this.offsetDistance = this.place[2];

        PubSub.publish('Location:z-scale-set', this.place[3]);

        this.getBoundingRect();
        this.getElevationData();
        this.setLocation();

    });

    PubSub.subscribe('AreaControls:area-width-change', (event) => {

        this.offsetDistance = event.detail;
        this.getBoundingRect();
        this.getElevationData();
        this.setLocation();

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
