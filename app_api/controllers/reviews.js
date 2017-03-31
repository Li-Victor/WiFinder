var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//res is the response. status is the HTTP status code. Content is what should be sent back
var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content); //the response sent back is in JSON form
};

//reading a review given its locationid and the reviewid. GET /api/locations/:locationid/reviews/:reviewid
module.exports.reviewsReadOne = function(req, res) {
    //checks if locationid and reviewid exists
    if(req.params && req.params.locationid && req.params.reviewid) {
        Loc
            .findById(req.params.locationid)
            //selecting only the name of location and their reviews. Mongoose provided function
            .select('name reviews')
            .exec(
                function(err, location) {
                    if(!location) {
                        sendJSONResponse(res, 404, {
                            "message": "locationid not found"
                        });
                        return;
                    } else if(err) {
                        sendJSONResponse(res, 400, err);
                        return;
                    }

                    var response, review;
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

//Creating a new review for a location
//Requires locationid, and post [author, rating, reviewText]
//POST /api/locations/locationid/reviews
module.exports.reviewsCreate = function(req, res) {
    var locationid = req.params.locationid;
    if(locationid) {
        //Find location and select the reviews
        Loc.findById(locationid)
        .select('reviews')
        .exec(function(err, location) {
            if(err) {
                sendJSONResponse(res, 400, err);
            } else { //add new review, passing in the request, response, and location object
                doAddReview(req, res, location);
            }
        });
    } else { //if no locationid
        sendJSONResponse(res, 404, {
            "message": "locationid not found and is required"
        });
    }
};

//from reviewsCreate
//doAddReview function runs when there is no error in providing the parent document(location)
var doAddReview = function(req, res, location) {
    if(!location) {
        sendJSONResponse(res, 404, {
            "messsage": "locationid not found"
        });
    } else {
        //pushing new data into the subdocument(review) array
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });

        //saving to the parent(location) document, but first update the average of this location
        location.save(function(err, location) { //callback before saving the location
            var thisReview;
            if(err) {
                console.log(err);
                sendJSONResponse(res, 400, err);
            } else {
                updateAverageRating(location._id); //updating the average rating of the location
                thisReview = location.reviews[location.reviews.length - 1]; //get the review just pushed
                sendJSONResponse(res, 201, thisReview); //send the review as a response
            }
        });
    }
};

//FROM doAddReview
//updating the location average rating when adding a new review
var updateAverageRating = function(locationid) {
    Loc
        .findById(locationid)
        .select('rating reviews')
        .exec(
            function(err, location) {
                //checking if locationid and location is found is correct. There should not be errors
                //location is the location that is being updated
                if(!err) doSetAverageRating(location);
            }
        );
};

//FROM updateAverageRating
var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    //if the location does have reviews and location has at least one review
    if(location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for(i = 0; i < reviewCount; i++) { //add up all the reviews
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;

        location.save(function(err) { //save rating to the parent document
            //do not have to send JSON response because it is already being sent
            if(err) console.log(err);
            else console.log('Average rating updated to', ratingAverage);
        });
    }
};


module.exports.reviewsUpdateOne = function(req, res) {
    if(!req.params.locationid || !req.params.reviewid) {
        sendJSONResponse(res, 404, {
            "message" : "Not found, locationid and reviewid are both required."
        });
        return;
    }

    Loc
        .findById(req.params.locationid)
        .select('reviews') //select only the reviews
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

            var thisReview;
            if(location.reviews && location.reviews.length > 0) {
                //finding subdocument
                thisReview = location.reviews.id(req.params.reviewid);

                if(!thisReview) {
                    sendJSONResponse(res, 404, {
                        "message" : "reviewid not found"
                    });
                } else {
                    //updating review subdocument
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;

                    //save the parent document
                    location.save(function(err, location) {
                        if(err) sendJSONResponse(res, 404, err);
                        else {
                            updateAverageRating(location._id);
                            sendJSONResponse(res, 200, thisReview);
                        }
                    });
                }
            } else {
                sendJSONResponse(res, 404, {
                    "message" : "No review to update"
                });
            }
        });
};

//deleting a review from a specific location
//DELETE /api/locations/:locationid/reviews/:reviewid
module.exports.reviewsDeleteOne = function(req, res) {
    if(!req.params.locationid || !req.params.reviewid) {
        sendJSONResponse(res, 404, {
            "message" : "Not found, locationid and reviewid are both required"
        });
        return;
    }

    //search location from the locationid and then get review from reviewid from location
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(function(err, location) {
            if(!location) {
                sendJSONResponse(res, 404, {
                    "message" : "locationid not found"
                });
                return;
            } else if(err) {
                sendJSONResponse(res, 404, err);
                return;
            }

            //there has to be a review
            if(location.reviews && location.reviews.length > 0) {
                //if reviewid is not in on the location
                if(!location.reviews.id(req.params.reviewid)) {
                    sendJSONResponse(res, 404, {
                        "message" : "reviewid not found"
                    });
                } else {
                    location.reviews.id(req.params.reviewid).remove(); //remove the subdocument review

                    //when review from location get deleted
                    location.save(function(err) {
                        if(err) {
                            sendJSONResponse(res, 404, err);
                            return;
                        } else {
                            //update the average rating
                            updateAverageRating(location._id);
                            sendJSONResponse(res, 204, null);
                        }
                    });
                }

            } else {
                sendJSONResponse(res, 404, {
                    "message" : "No review to delete"
                });
            }
        });
};
