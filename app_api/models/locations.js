var mongoose = require('mongoose');

//schema for reviews
var reviewSchema = new mongoose.Schema({
    author: String,
    rating: {type: Number, required: true, min: 0, max:5},
    reviewText: String,
    createdOn: {type: Date, default: Date.now}
});

//schema for the opening times
var openingTimeSchema = new mongoose.Schema({
    days: {type: String, required: true},
    opening: String,
    closing: String,
    closed: {type: Boolean, required: true}
});

//schema for locations
var locationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: String,
    rating: {type: Number, "default": 0, min: 0, max: 5},
    //facilities is an array of string
    facilities: [String],
    coords: {type: [Number], index: '2dsphere'},
    //nested schema for both openingTimes and reviews
    openingTimes: [openingTimeSchema],
    reviews: [reviewSchema]
});

mongoose.model('Location', locationSchema);
