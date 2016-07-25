var app = angular.module('mapApp', []);

app.controller('mapController', function($scope, $http) {
  $scope.getDirection = function() {
    var originLatLong = $scope.originLatitude + ', ' + $scope.originLongitude;
    var destLatLong = $scope.destLatitude + ', ' + $scope.destLongitude;
    var locations = {
      "origin": originLatLong,
      "destination": destLatLong
    };
    $http.post('/mapDirection', locations).then(function(){
      alert("Success!");
    });
  };
});
