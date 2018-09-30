const PubSub = require('../helpers/pub_sub')

const AreaControls = function(container, areaWidth){

    this.container = container;
    this.areaWidth = areaWidth;

    this.wrapper = null;
    this.rangeControl = null;
    this.numberControl = null;
};

AreaControls.prototype.bindEvents = function(){

    this.render();

    PubSub.subscribe("Location:area-width-set", (event) => {

        this.areaWidth = event.detail;
        this.numberControl.value = this.areaWidth;
        this.rangeControl.value = this.areaWidth;
    });

};

AreaControls.prototype.areaWidthChange = function(event){

    this.areaWidth = event.target.value;

    this.numberControl.value = this.areaWidth;
    this.rangeControl.value = this.areaWidth;

    PubSub.publish('AreaControls:area-width-change', this.areaWidth);

};


AreaControls.prototype.render = function(){

    if(this.wrapper === null){


        this.wrapper = document.createElement('div');
        this.wrapper.id = 'area-width-controls';

        const label = document.createElement('p');
        label.id = 'area-width-label';
        label.innerHTML = 'Area (m)';
        this.wrapper.appendChild(label);


        this.rangeControl = document.createElement('input');
        this.rangeControl.id = 'area-width-range';
        this.rangeControl.setAttribute('type', 'range');
        this.rangeControl.setAttribute('min', '1000');
        this.rangeControl.setAttribute('max', '20000');
        this.rangeControl.setAttribute('step', '1');
        this.rangeControl.setAttribute('value', this.areaWidth);

        this.rangeControl.addEventListener('change', this.areaWidthChange.bind(this));

        this.wrapper.appendChild(this.rangeControl);

        this.numberControl = document.createElement('input');
        this.numberControl.id = 'area-width-number';
        this.numberControl.setAttribute('type', 'number');
        this.numberControl.setAttribute('min', '1000');
        this.numberControl.setAttribute('max', '20000');
        this.numberControl.setAttribute('step', '1');
        this.numberControl.setAttribute('value', this.areaWidth);

        this.numberControl.addEventListener('change', this.areaWidthChange.bind(this));

        this.wrapper.appendChild(this.numberControl);

        this.container.insertBefore(this.wrapper, this.container.firstChild);

    }


};

module.exports = AreaControls;