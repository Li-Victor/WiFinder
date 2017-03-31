//custom filter formatDistance to display
angular.module('WiFinderApp').filter('formatDistance', function() {

    //returns a function to
    return function(distance) {
        //check if a distance is numeric
        var _isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

        //formatting
        var numDistance, unit;

        if(distance && _isNumeric(distance)) {
            if(distance > 1) {
                numDistance = parseFloat(distance).toFixed(1);
                unit = 'km';
            } else {
                numDistance = parseInt(distance * 1000, 10);
                unit = 'm';
            }

            return numDistance + unit;
        } else {
            return '?';
        }
    };

});
