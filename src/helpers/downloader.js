

const Downloader = function(filename, downloadJSON){

  this.downloadJSON = downloadJSON;
  this.fileName = filename;

};

Downloader.prototype.download = function() {

  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.downloadJSON));
  element.setAttribute('download', this.fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

};


module.exports = Downloader;
