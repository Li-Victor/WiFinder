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
    res.render('location-info', {
        title: 'Location info',
        pageHeader: {title: 'Starcups'},
        sidebar: {
            context: 'is on Wi-Finder because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'re been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: {
            name: 'Starcups',
            address: '125 High Street, Reading RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            coords: {lat: 51.455041, long: -0.9690884 },
            openingTimes: [{
                days: 'Monday - Friday',
                opening: '7:00am',
                closing: '7:00pm',
                closed: false
            }, {
                days: 'Saturday',
                opening: '8:00am',
                closing: '5:00pm',
                closed: false
            }, {
                days: 'Sunday',
                closed: true
            }],
            reviews: [{
                author: 'George Lu',
                rating: 5,
                timestamp: 'March 20 2017',
                reviewText: 'What a great place. I can\'t say enough good things about it.'
            }, {
                author: 'Kevin Wong',
                rating: 3,
                timestamp: 'March 22 2017',
                reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
            }]
        }
    });
  };

// GET 'Add review' page
module.exports.addReview = function (req, res) {
    res.render('location-review-form', {
        title: 'Review Starcups on Wi-Finder',
        pageHeader: {title: 'Review Starcups'}
    });
  };
