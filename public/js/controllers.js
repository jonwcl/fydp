var app = angular.module('mapApp', ['mapController', 'geolocation']);
var mapController = angular.module('mapController', ['geolocation']);

mapController.controller('mapController', function($scope, $http, geolocation) {
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

  $scope.getCurrentLocation = function(){
    geolocation.getLocation().then(function(data){
      $scope.originLatitude = data.coords.latitude;
      $scope.originLongitude = data.coords.longitude;
    });
  };
});
