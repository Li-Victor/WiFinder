angular.module('WiFinderApp').controller('locationListCtrl', function($scope, locationListService) {

    //default message to the homepage, before hitting api
    $scope.message = 'Searching for nearby places';

    //location service returns a promise
    locationListService
        .success(function(data) { //if successful
            //clear the message if there is a location found, if not display "No locations found"
            $scope.message = data.length > 0 ? "" : "No locations found";
            $scope.data = { locations: data };
        })
        .error(function(e) {
            //display error message
            $scope.message = "Sorry, something's gone wrong";
        });
});
