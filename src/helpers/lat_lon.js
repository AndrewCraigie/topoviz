
const LatLon = function(lat, lon){

        this.lat = lat;
        this.lng = lon;

};

LatLon.prototype.destinationPoint = function(distance, bearing){

    // Method adapted from code at:
    // https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js

    const radius =  6371e3;

    const angDist = distance / radius; // angular distance in radians
    const brng = this.toRadians(bearing);

    const lat1 = this.toRadians(this.lat);
    const long1 = this.toRadians(this.lng);

    const sinLat1 = Math.sin(lat1);
    const cosLat1 = Math.cos(lat1);
    const sinAngDist = Math.sin(angDist);
    const cosAngDist = Math.cos(angDist);
    const sinBrng = Math.sin(brng);
    const cosBrng = Math.cos(brng);

    const sinLat2 = sinLat1 * cosAngDist + cosLat1 * sinAngDist * cosBrng;
    const lat2 = Math.asin(sinLat2);
    const y = sinBrng * sinAngDist * cosLat1;
    const x = cosAngDist - sinLat1 * sinLat2;
    const long2 = long1 + Math.atan2(y, x);


    return new LatLon(this.toDegrees(lat2), ((this.toDegrees(long2)) + 540) % 360 - 180)

};



LatLon.prototype.toRadians = function(number){
    return number * Math.PI / 180;
};

LatLon.prototype.toDegrees = function(number){
    return number * 180 / Math.PI;
};

module.exports = LatLon;

