// res.render renders index.jade file

var request = require('request');
var apiOptions = {
    server: 'http://localhost:3000' //default server url for api
};
if(process.env.NODE_ENV === 'production') {
    apiOptions.server = 'http://wifi-nder.herokuapp.com'; //production server for api
}

//FROM module.exports.homelist
var renderHomepage = function(req, res, responseBody) {
    // the message should display when something has happened with the api, or there are no places nearby
    var message;
    if(!(responseBody instanceof Array)) { //API lookup error
        message = "API lookup error";
        responseBody = [];
    } else {
        if(!responseBody.length) { //there are no places nearby
            message = "No places found nearby";
        }
    }

    //seperating data from the views
    res.render('locations-list', {
        //for <title> tag
        title: 'Wi-Finder - find a place to work with wifi',
        //adding text for the page headers
        pageHeader: {
            title: 'Wi-Finder',
            strapline: 'Find places to work with wifi near you!'
        },
        //text to the sidebar
        sidebar: 'Looking for wifi and a seat? Wi-Finder helps you find places to work when out and about. Perhaps with coffee, cake, or a pint? Let Wi-Finder help you the place you\'re looking for.',
        //locations from the responseBody

        //the response body has all the closest
        locations: responseBody,
        message: message

    });

};

// GET 'home' page
module.exports.homelist = function (req, res) {
    var path = '/api/locations';
    //request body
    var requestOptions = {
        url: apiOptions.server + path,
        method: "GET",
        json: {},
        qs: {
            long: -0.7992599,
            lat: 51.378091,
            maxDistance: 20 //From 20 km away
        }
    };
    //the callback renders the homepage
    request(requestOptions, function(err, response, body) {
        //formatting the distances
        data = body;

        //if the status code is 200, and there happens to be data, we should format the distances
        if(response.statusCode === 200 && data.length) {
            for (var i = 0; i < data.length; i++) {
                data[i].distance = _formatDistance(data[i].distance);
            }
        }

        //will always render the homepage even if there is not locations nearby
        renderHomepage(req, res, data);
    });
  };

//FROM module.exports.homelist when the distance needs to be formatted into km or m
var _formatDistance = function(distance) {
    var numDistance, unit;
    if(distance > 1) { //if over 1 km
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
    } else { //convert to closest meters
        numDistance = parseInt(distance * 1000, 10);
        unit = 'm';
    }
    return numDistance + unit;
};

// GET 'Location info' page
module.exports.locationInfo = function (req, res) {
    //call get method to api from the location id
    var path = '/api/locations/' + req.params.locationid;

    var requestOptions = {
        url: apiOptions.server + path,
        method: "GET",
        json: {}
    };

    //the callback renders the
    request(requestOptions, function(err, response, body) {
        var data = body;

        //if successfully get a 200 success response code, then render the details page
        if(response.statusCode === 200) {
            //separate the coords
            data.coords = {
                long: body.coords[0],
                lat: body.coords[1]
            };
            renderDetailPage(req, res, data);
        } else { //shows error page
            _showError(req, res, response.statusCode);
        }

    });

};

//this function is called from locatoininfo
//show and error page
var _showError = function(req, res, status) {
    var title, content;

    if(status === 404) {
        title = '404, page not found';
        content = 'Oh dear. Looks like we can\'t find this page. Sorry';
    } else {
        title = status + ', something\'s gone wrong';
        content = "Something, somewhere, has gone just a little wrong";
    }
    res.status(status);

    //render the generic-text jade file
    res.render('generic-text', {
        title: title,
        content: content
    });
};

//FROM locationInfo
//renders any location homepage, locationinfo is the object that was sent form the api
var renderDetailPage = function(req, res, locationDetail) {

    res.render('location-info', {

        //calling name from details sent from requesting API
        title: locationDetail.name,
        pageHeader: {title: locationDetail.name},
        sidebar: {
            context: locationDetail.name + ' is on Wi-Finder because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'re been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },

        location: locationDetail
    });
};

// GET 'Add review' page
module.exports.addReview = function (req, res) {
    res.render('location-review-form', {
        title: 'Review Starcups on Wi-Finder',
        pageHeader: {title: 'Review Starcups'}
    });
  };
