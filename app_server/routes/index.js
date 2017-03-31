var express = require('express');
var router = express.Router();

//requiring the controller files
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

//define location routes and map them to the correct controller functin
router.get('/', ctrlLocations.homelist);
//locationid as param
router.get('/location/:locationid', ctrlLocations.locationInfo);

//gooes to view of adding a new review
router.get('/location/:locationid/review/new', ctrlLocations.addReview);

// post method to add a new review to a location, given locationid
router.post('/location/:locationid/review/new', ctrlLocations.doAddReview);

// Other pages from Others controller
router.get('/about', ctrlOthers.about);

module.exports = router;
