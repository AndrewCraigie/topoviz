const PubSub = require('./pub_sub');
const Request = require('./request');
const Downloader = require('./downloader');

const BingApi = function (url, apiKey) {

    this.url = url;
    this.apiKey = apiKey;

    this.parameters = null;
    this.requestUrl = null;

    this.place = null;


};

// http://dev.virtualearth.net/REST/v1/Elevation/Bounds?bounds=boundingBox&rows=rows&cols=cols&heights=heights&key=BingMapsKey
// http://dev.virtualearth.net/REST/v1/Elevation/SeaLevel?points=lat1,long1,lat2,long2,latn,longn&key=BingMapsKey

// bounds=45.219,-122.234,47.61,-122.07

BingApi.prototype.bindEvents = function () {

    PubSub.subscribe('Location:request-elevation-data', (event) => {

        this.parameters = event.detail[0];
        this.place = event.detail[1];


        this.buildRequestUrl();

        this.makeRequest();

        // Publish response
    });

};

BingApi.prototype.makeRequest = function(){

    const request = new Request(this.requestUrl);
    request.get()
        .then((response) => {

            const resources = response.resourceSets[0].resources[0];

            const place = {
              name: this.place[0],
              latlng: this.place[1],
              areaWidth: this.place[2],
              elevationScale: this.place[3],
              zoom: resources.zoomLevel,
              elevations: resources.elevations
            };

            const placeJSON = JSON.stringify(place);

            const fileName = place.name.toLowerCase().split(" ").join("_") + '.json';
            const downloader = new Downloader(fileName, placeJSON);
            downloader.download();

            PubSub.publish('BingApi:elevations-available', resources);

        })
        .catch((error) => {
            console.error(error);
        });


};

BingApi.prototype.buildRequestUrl = function () {

    let url = this.url;
    url += `${this.parameters.route}?`;

    for (let param in this.parameters.parameters) {
        if (this.parameters.parameters.hasOwnProperty(param)) {

            url += `${param}=${this.parameters.parameters[param]}&`;

        }
    }

    url += `key=${this.apiKey}`;

    this.requestUrl = url;


};

module.exports = BingApi;
