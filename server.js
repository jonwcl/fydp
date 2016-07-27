// Dependencies
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');

var google = 'https://maps.googleapis.com/maps/api/directions/';
var googleAPIKey = 'AIzaSyDrCDc2H3nnU1Xzse6kLULKvwWGeRwUY_s';
var mongoscheme = require('./app');
var url = 'mongodb://localhost:27017/map_edges_storage';//db 
const mongoose = require('mongoose');
const options = {server: {socketOptions: {keepAlive: 1}}};
mongoose.connect(url, options);
var Factory = new mongoscheme.Factory(mongoose.Schema,mongoose);
var createSchemas = new Factory.createSchemas();

var app = express();

// Using JSON parser
app.use(bodyParser.json());

// Serve Public Static
app.use(express.static('public'));

// Functions

app.post('/mapDirection', function (req, res) {
    console.log(req.body);
    var time = Date.now();

//    if (!req.body || !req.body.origin || !req.body.destination) {
//        res.writeHead(400);
//        return res.end('Error');
//    }
//    else if (req.body.dTime && req.body.dTime < time) {
//        return res.end('Error');
//    }
//    else if (!req.body.dTime) {
//        req.body.dTime = time;
//    }
//    res.writeHead(200, { 'Content-Type': 'application/json' });

//    var goog = google;
//    goog = goog + 'json?origin=' + req.body.origin;
//    goog = goog + '&destination=' + req.body.destination;
//    goog = goog + '&departure_time=' + req.body.dTime;
//    goog = goog + '&key=' + googleAPIKey;

//    request(goog, function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            console.log(body); // Show the HTML for the Google homepage.
//            return res.end(body);


//            //send to database
//        }
//        return res.end(error);
//    });

    var parse = req.body;
    if(parse.status=="OK"){
        var parsed = req.body.routes[0].legs[0].steps;
        for(var i=0;i<parsed.length;i++){
            var edge = parsed[i];
            //console.dir(edge);
            if(i==0){
                var startNode = new mongoscheme.MapNode({
                    location : {
                        lat : edge.start_location.lat,
                        lng : edge.start_location.lng
                    }
                });
                startNode.save(function(err, startNode) {
                    if (err) return console.log("failed node");
                    else {
                        console.log("inserted node");
                        console.log(startNode.location);
                    }
                });                             
            }
            var mapEdgeEntry = new mongoscheme.MapEdge({
                 distance : {
                    text : edge.distance.text,
                    value : edge.distance.value
                 },
                 duration : {
                    text : edge.duration.text,
                    value : edge.duration.value
                 },
                 end_location : {
                    lat : edge.end_location.lat,
                    lng : edge.end_location.lng
                 },
                 start_location : {
                    lat : edge.start_location.lat,
                    lng : edge.start_location.lng
                 },
            });
            var endNode = new mongoscheme.MapNode({
                location : {
                    lat : edge.end_location.lat,
                    lng : edge.end_location.lng
                }
            });
            if(time)mapEdgeEntry.start_time = time;
            mapEdgeEntry.save(function(err, mapEdgeEntry) {
              if (err) return console.log("failed edge");
              else{
                console.log("inserted edge");
                //console.log(edge.distance);
                console.log(mapEdgeEntry.distance);
              }
            });
            endNode.save(function(err, endNode) {
              if (err) return console.log("failed node");
              else {
                console.log("inserted node");
                console.log(endNode.location);            
               }

            });                                    
        };
    }

});

// Listen
app.listen(3000, function () {
    console.log('FYDP app listening on port 3000!');
});
