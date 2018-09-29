const PubSub = require('../helpers/pub_sub');
const ZOverlay = require('./z_overlay');

const ZControl = function(element, zScale){

    this.element = element;
    this.zScale = zScale;
    this.zOverlay = new ZOverlay(this.element.parentElement, this.zScale);
    this.zOverlay.bindEvents();

};

ZControl.prototype.bindEvents = function(){

    this.setPosition();

    this.element.addEventListener('change', (event) => {
        this.zScale = event.target.value;
        PubSub.publish('ZControl:value-changed', this.zScale);
    });

    PubSub.subscribe('Location:z-scale-set', (event) => {
        this.zScale = event.detail;
        this.setPosition();
        PubSub.publish('ZControl:value-changed-program', this.zScale);
    });

};

ZControl.prototype.setPosition = function(){

    this.element.value = this.zScale;
};

module.exports = ZControl;