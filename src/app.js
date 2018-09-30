const BingApi = require('./helpers/bing_api');
const LatLon = require('./helpers/lat_lon');
const Location = require('./models/location');
const MapWrapper = require('./views/map_wrapper');
const ElevationView = require('./views/elevation_view');
const ZControl = require('./views/z_control');
const AreaControls = require('./views/area_controls');
const PlacesView = require('./views/places_view');


document.addEventListener('DOMContentLoaded', function(){


    const startLocation = new LatLon(55.865360, -4.257592);

    const startZoom = 12;
    //const startOffsetDistance = 2000;
    const startOffsetDistance = 20000;

    const startZScale = 5;

    const mapControlsContainer = document.querySelector('#map-controls');

    const zControlElement = document.querySelector('#z-range');
    const zControl = new ZControl(zControlElement, startZScale);
    zControl.bindEvents();


    const elevationContainer = document.querySelector('#elevation-container');
    const elevationView = new ElevationView(elevationContainer, startZScale);
    elevationView.bindEvents();


    //const elevationApiUrl = "http://dev.virtualearth.net/REST/v1/Elevation/";
    const elevationApiUrl = "https://dev.virtualearth.net/REST/v1/Elevation/";
    const apiKey = 'Ak3Le33PqOypsaz7G7cbXafcWI5Ibik80dXKCtnbMwCvZW0M9yc1tLZeFwijtrqw';
    const bingApi = new BingApi(elevationApiUrl, apiKey);
    bingApi.bindEvents();

    const areaControls = new AreaControls(mapControlsContainer, startOffsetDistance);
    areaControls.bindEvents();


    const location = new Location(startLocation, startOffsetDistance);
    location.bindEvents();

    const places = [
        ['Mount Fuji', [35.362896, 138.730367], 7000, 1, "mount_fuji.json"],
        ['Niagra Falls', [43.082557, -79.074514], 1000, 12, "niagra_falls.json"],
        ['Crater Lake', [42.942645, -122.107659], 8000, 3, "crater_lake.json"],
        ['Mount Everest', [27.980478, 86.920695], 20000, 12, "mount_everest.json"],
        ['Mount Vesuvius', [40.820830, 14.425886], 4000, 3, "mount_vesuvius.json"],
        ['Grand Canyon', [36.075888, -112.028380], 20000, 1, "grand_canyon.json"],
        ['Uluru', [-25.344654, 131.037508], 2000, 5, "uluru.json"],
        ['Easter Island', [-27.118031, -109.362453], 12000, 3, "easter_island.json"],
        ['Bingham Canyon Mine', [40.522902, -112.152245], 3000, 4, "bingham_canyon_mine.json"],
        ['Barringer Crater, Arizona', [35.027521, -111.022114], 1000, 7, "barringer_crater_arizona.json"],
        ['Ngorongoro Crater', [-3.173948, 35.588702], 20000, 1, "ngorongoro_crater.json"],
        ['Mount Fogo', [14.939883, -24.379089], 15000, 1, "mount_fogo.json"],
        ['Mount St Helens', [46.200082, -122.187705], 3000, 3, "mount_st_helens.json"]


    ];

    const placesView = new PlacesView(mapControlsContainer, places);
    placesView.bindEvents();



    const mapContainer = document.querySelector('#map-container');
    const mapWrapper = new MapWrapper(mapContainer, startLocation, startZoom);
    mapWrapper.bindEvents();






});
