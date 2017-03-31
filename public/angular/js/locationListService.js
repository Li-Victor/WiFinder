angular.module('WiFinderApp').service('locationListService', function($http) {
    return $http.get('/api/locations?long=-0.9992599&lat=51.378091&maxDistance=20');
});
