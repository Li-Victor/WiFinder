var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//res is the response. status is the HTTP status code. Content is what should be sent back
var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content); //the response sent back is in JSON form
};

//reading a location given its locationid. GET /locations/:locationid
module.exports.locationsReadOne = function(req, res) {
    //checks if locationid exists
    if(req.params && req.params.locationid) {
        Loc
            .findById(req.params.locationid)
            .exec(function(err, location) {
                //if there is no location returned
                if(!location) {
                    sendJSONResponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;
                } else if(err) { // if there happens to be an error
                    sendJSONResponse(res, 404, err);
                    return;
                }
                sendJSONResponse(res, 200, location);
            });
    } else {
        //if request parameters did not include locationid
        sendJSONResponse(res, 404, {
            "message": "No locationid in request"
        });
    }

};

//getDistanceFromRads converts radians to distance
//getRadsFromDistance converts distance to radians
var earth = (function(){
    var earthRadius = 6371; //km, 3959 miles

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    };
})();

//getting locations by the latitude and longitude. GET /locations/long=?lat=?
module.exports.locationsListByDistance = function(req, res) {
    var long = parseFloat(req.query.long);
    var lat = parseFloat(req.query.lat);

    var point = {
        type: "Point",
        coordinates: [long, lat]
    };

    var geoOptions = {
        spherical: true,
        maxDistance: earth.getRadsFromDistance(20), //maximum distance of 20km
        num: 10
    };

    //if long and lat does not exist
    if(!long || !lat) {
        sendJSONResponse(res, 404, {
            "message" : "long and lat query parameters are required"
        });
        return;
    }

    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations = []; //results are in location
        if(err) {
            sendJSONResponse(res, 404, err);
        } else {
            results.forEach(function(doc) {
                locations.push({
                    distance: earth.getDistanceFromRads(doc.dis),
                    name: doc.obj.name,
                    address: doc.obj.address,
                    rating: doc.obj.rating,
                    facilities: doc.obj.facilities,
                    _id: doc.obj._id
                });
            });
            sendJSONResponse(res, 200, locations);
        }
    });
};
