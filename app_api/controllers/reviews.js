var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//res is the response. status is the HTTP status code. Content is what should be sent back
var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content); //the response sent back is in JSON form
};

//reading a review given its locationid and the reviewid. GET /locations/:locationid/reviews/:reviewid
module.exports.reviewsReadOne = function(req, res) {
    //checks if locationid and reviewid exists
    if(req.params && req.params.locationid && req.params.reviewid) {
        Loc
            .findById(req.params.locationid)
            //selecting only the name of location and their reviews. Mongoose provided function
            .select('name reviews')
            .exec(
                function(err, location) {
                    var response, review;
                    if(!location) {
                        sendJSONResponse(res, 404, {
                            "message": "locationid not found"
                        });
                        return;
                    } else if(err) {
                        sendJSONResponse(res, 400, err);
                        return;
                    }

                    //checks to see that the location has reviews
                    if(location.reviews && location.reviews.length > 0) {
                        //Mongoose get subdocument by using id
                        review = location.reviews.id(req.params.reviewid);
                        if(!review) { //if review is not found
                            sendJSONResponse(res, 404, {
                                "message" : "reviewid not found"
                            });
                            return;
                        } else { // if review is found, Hooray!
                            response = {
                                location: {
                                    name: location.name,
                                    id: req.params.locationid
                                },
                                review: review
                            };
                            sendJSONResponse(res, 200, response);
                        }
                    } else { //if there are no reviews
                        sendJSONResponse(res, 404, {
                            "message" : "No reviews found"
                        });
                    }
                }
            );
    } else {
        sendJSONResponse(res, 404, {
            "message" : "Not found, locationid and reviewid are both required"
        });
    }
};
