const PubSub = require('../helpers/pub_sub');

const ZOverlay = function(container, zScale){

    this.container = container;
    this.zScale = zScale;
    this.element = null;
};

ZOverlay.prototype.bindEvents = function(){

    this.render();

    PubSub.subscribe('ZControl:value-changed', (event) => {
        this.zScale = event.detail;
        this.render();
    });

    PubSub.subscribe('ZControl:value-changed-program', (event) => {
        this.zScale = event.detail;
        this.element.innerHTML = `Elevation scale: ${this.zScale}`;
    });
};

ZOverlay.prototype.render = function(){

    if (this.element === null){
        this.element = document.createElement('p');
        this.element.id = 'z-scale';
        this.container.appendChild(this.element);

    }

    this.element.innerHTML = `Elevation scale: ${this.zScale}`;

};

module.exports = ZOverlay;