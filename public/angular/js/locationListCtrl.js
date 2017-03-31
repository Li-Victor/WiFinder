angular.module('WiFinderApp').controller('locationListCtrl', function($scope) {
    $scope.data = {
        locations: [{
            name: 'Starcups',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '0.296456',
            _id: '58dc90c71c3ef80889e091b7'
        }, {
            name: 'Zlihp Coffee',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 5,
            facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
            distance: '0.7865456',
            _id: '58dc901c1c3ef80889e091b4'
        }]
    };
});
