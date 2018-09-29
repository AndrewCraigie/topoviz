const PubSub = require('../helpers/pub_sub');
const LatLon = require('../helpers/lat_lon');

const PlacesView = function(container, places){

    this.container = container;
    this.places = places;

};

PlacesView.prototype.bindEvents = function(){

    this.render();

};

PlacesView.prototype.placeChanged = function(event){

    const placeIndex = event.target.value;

    const place = this.places[placeIndex];

    PubSub.publish('PlacesView:place-selected', place);

};

PlacesView.prototype.render = function(){


    const placesSelect = document.createElement('select');
    placesSelect.id = 'places-select';

    const defaultOption = document.createElement('option');
    defaultOption.setAttribute('disabled', 'disabled');
    defaultOption.setAttribute('selected', 'selected');
    defaultOption.setAttribute('value', '');
    defaultOption.innerText = '-- Select an Interesting Place --';
    placesSelect.appendChild(defaultOption);

    this.places.map((place, i, arr) => {

        let option = document.createElement('option');
        option.setAttribute('value', i);
        option.innerText = place[0];
        placesSelect.appendChild(option);

    });

    placesSelect.addEventListener('change', this.placeChanged.bind(this));
    this.container.appendChild(placesSelect);

};

module.exports = PlacesView;