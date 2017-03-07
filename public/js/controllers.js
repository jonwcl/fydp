var app = angular.module('mapApp', ['mapController', 'geolocation']);
var mapController = angular.module('mapController', ['geolocation']);

mapController.controller('mapController', function($scope, $http, $window, geolocation) {
  $scope.getDirection = function() {
    var originLatLong = $scope.originLatitude + ', ' + $scope.originLongitude;
    var destLatLong = $scope.destLatitude + ', ' + $scope.destLongitude;
    var locations = {
      "origin": originLatLong,
      "destination": destLatLong
    };

    var history = {
        destination: {
            lat: Number($scope.destLatitude),
            lng: Number($scope.destLongitude)
        },
        origin: {
            lat: Number($scope.originLatitude),
            lng: Number($scope.originLongitude)
        },
        complete: false,
        lastRequest : [Date.now()]
    };
    console.log("hi");
    $http.post('/Request', history).then();
    console.log("hi");
    $window.directionsService.route({
      origin: originLatLong,
      destination: destLatLong,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }, function(response, status) {
      if (status) {
        //console.log(response);
        //console.log(status);
        //var temp = response.route[0];
        //response.route[0] = response.route[1];
        //response.route[1] = temp;
        step_one = response.routes[0].legs[0].steps
        var path_one = [];
        start_one = step_one[0].start_location.lat().toFixed(7) + "," + step_one[0].start_location.lng().toFixed(7);
        path_one.push(start_one);
        for (var i in step_one) {
            path_one.push(step_one[i].end_location.lat().toFixed(7) + "," + step_one[i].end_location.lng().toFixed(7));
        }
        //console.log(path_one);

        step_two = response.routes[1].legs[0].steps
        var path_two = [];
        start_two = step_two[0].start_location.lat().toFixed(7) + "," + step_two[0].start_location.lng().toFixed(7);
        path_two.push(start_two);
        for (var i in step_two) {
            path_two.push(step_two[i].end_location.lat().toFixed(7) + "," + step_two[i].end_location.lng().toFixed(7));
        }

        //console.log(path_two);

        step_three = response.routes[2].legs[0].steps
        var path_three = [];
        start_three = step_three[0].start_location.lat().toFixed(7) + "," + step_three[0].start_location.lng().toFixed(7);
        path_three.push(start_three);
        for (var i in step_three) {
            path_three.push(step_three[i].end_location.lat().toFixed(7) + "," + step_three[i].end_location.lng().toFixed(7));
        }

        //console.log(path_three);

        var routes = {"routes": [path_one, path_two, path_three]};

        console.log(routes);
        $http.post('/choosePath', routes).then(function(data){
            console.log("choosePath");
            console.log(data);
            $window.directionsDisplay.setDirections(response);
            alert("Success!");
        });
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
  };

  $scope.getCurrentLocation = function(){
    geolocation.getLocation().then(function(data){
      $scope.originLatitude = data.coords.latitude;
      $scope.originLongitude = data.coords.longitude;
    });
  };
});
