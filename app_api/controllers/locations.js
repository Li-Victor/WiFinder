var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//res is the response. status is the HTTP status code. Content is what should be sent back
var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content); //the response sent back is in JSON form
};

//reading a location given its locationid. GET /api/locations/:locationid
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

//getting locations by the latitude and longitude. GET /api/locations/long=?&lat=?
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


//Creating a new location, that requires the name, address, facilities, coords, and two openingTimes.
//openingTimes is with days1, days2, opening1, opening2, closing1, closing2, closed1, closed2
//The opening times has two entries for the opening times
//POST /api/locations
module.exports.locationsCreate = function(req, res) {
    console.log(req.body.facilities);
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(','), //split the array of facilities
        coords: [parseFloat(req.body.long), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }]
    }, function(err, location) { //callback function from creating new location
        if(err) { //if there is an error
            sendJSONResponse(res, 400, err);
        } else { //new locatoin created
            sendJSONResponse(res, 201, location);
        }
    });
};

//updating a specific location by its id
//requires the name, address, facilities, coords, and two openingTimes.
//openingTimes is with days1, days2, opening1, opening2, closing1, closing2, closed1, closed2
//PUT /api/locations/:locationid
module.exports.locationsUpdateOne = function(req, res) {
    if(!req.params.locationid) {
        sendJSONResponse(res, 404, {
            "message" : "Not found, locationid is required."
        });
    }
    Loc
        //find the document
        .findById(req.params.locationid)
        //do not want to select reviews and raing
        .select('-reviews -rating')
        .exec(function(err, location) {
            if(!location) {
                sendJSONResponse(res, 404, {
                    "message" : "locationid not found"
                });
                return;
            } else if(err) {
                sendJSONResponse(res, 400, err);
                return;
            }
            //changing the location information from exec()
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(',');
            location.coords = [parseFloat(req.body.long), parseFloat(req.body.lat)];
            location.openingTimes = [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1
            }, {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
            }];

            //save updated location
            location.save(function(err, location) {
                if(err) {
                    sendJSONResponse(res, 404, err);
                } else {
                    sendJSONResponse(res, 200, location);
                }
            });
        });
};

//deleting a document given the id of location
//DELETE /api/locations/:locationid
module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if(locationid) {
        Loc
            .findByIdAndRemove(locationid)
            .exec(function(err, location) {
                if(err) {
                    sendJSONResponse(res, 404, err);
                    return;
                }
                //success of deleting document
                sendJSONResponse(res, 204, null);

            });
    } else {
        sendJSONResponse(res, 404, {
            "message" : "No locationid"
        });
    }
};
