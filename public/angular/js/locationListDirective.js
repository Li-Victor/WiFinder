//custom directive for showing rating stars
angular.module('WiFinderApp').directive('ratingStars', function() {
    return {
        scope: {
            //binding with thisRating, thisRating is to be in the templateUrl
            thisRating : '=rating'
        },
        //update the template to use the new variable
        templateUrl : '/angular/js/rating-stars.html'
    };
});
