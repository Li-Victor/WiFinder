// res.render renders index.jade file
// GET 'home' page
module.exports.homelist = function (req, res) {
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
        //all the different locations
        locations: [{
            name: 'Starcups',
            address: '125 High Street, Reading RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '100m'
        }, {
            name: 'Zlihp Coffee',
            address: '125 High Street, Reading RG6 1PS',
            rating: 4,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '200m'
        }, {
            name: '7-11',
            address: '125 High Street, Reading RG6 1PS',
            rating: 2,
            facilities: ['Food', 'Premium wifi'],
            distance: '250m'

        }]
    });
  };

// GET 'Location info' page
module.exports.locationInfo = function (req, res) {
    res.render('location-info', { title: 'Location info' });
  };

// GET 'Add review' page
module.exports.addReview = function (req, res) {
    res.render('location-review-form', { title: 'Add review' });
  };
