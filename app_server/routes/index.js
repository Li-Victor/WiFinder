var express = require('express');
var router = express.Router();

//requiring the controller files
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

//define location routes and map them to the correct controller functin
router.get('/', ctrlLocations.homelist);
//locationid as param
router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

// Other pages from Others controller
router.get('/about', ctrlOthers.about);

module.exports = router;
