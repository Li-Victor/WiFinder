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
    res.render('location-review-form', { title: 'Add review' });
  };
