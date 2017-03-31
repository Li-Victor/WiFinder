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

    });

};

// GET 'home' page
module.exports.homelist = function (req, res) {
    renderHomepage(req, res);
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
//renders a specific location via getLocationInfo
module.exports.locationInfo = function (req, res) {
    //responseData is the location object
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });

};

//module.exports.locationInfo and module.exports.addReview calls,
//this calls api to find specific location from locationid, and has a callback
var getLocationInfo = function(req, res, callback) {
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
            callback(req, res, data);
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
    getLocationInfo(req, res, function(req, res, response) {
        renderReviewForm(req, res, response);
    });
};

var renderReviewForm = function(req, res, locationDetail) {
    res.render('location-review-form', {
        title: 'Review ' + locationDetail.name + ' on WiFinder',
        pageHeader: {title: 'Review ' + locationDetail.name},
        error: req.query.err
    });
};

//POST 'Add review'
module.exports.doAddReview = function(req, res) {
    var locationid = req.params.locationid;
    var path = '/api/locations/' + locationid + '/reviews';

    //JSON post data
    var postData = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };

    var requestOptions = {
        url: apiOptions.server + path,
        method: 'POST',
        json: postData
    };

    //if any of the author, rating, and reivewText is falsey, like when one field is empty when POSt
    //immediately redirect to review form with error, instead of trying to hit an api
    if(!postData.author || !postData.rating || !postData.reviewText) {
        res.redirect('/location/' + locationid + '/review/new?err=val');
    } else {
        //make API request
        request(requestOptions, function(err, response, body) {
            if(response.statusCode === 201) { //if successfully POST, redirect to the location info page
                res.redirect('/location/' + locationid);
            } else if(response.statusCode === 400 && body.name && body.name === 'ValidationError') { //server side checking with mongoose
                res.redirect('/location/' + locationid + '/review/new?err=val'); //redirects to a review form, passing an error flag in query string
            } else {
                _showError(req, res, response.statusCode);
            }
        });
    }


};
