const Request = function(url){
    this.url = url;
};

Request.prototype.get = function(){

    return fetch(this.url)
        .then((response) => {
            if (response.status != '200'){
                throw `Error: ${response.status}, ${response.statusText}`
            } else {
                return response;
            }
        })
        .then(response => response.json());
};

module.exports = Request;
