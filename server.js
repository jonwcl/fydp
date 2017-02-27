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
const options = { server: { socketOptions: { keepAlive: 1 } } };
var requestDB = mongoose.createConnection('mongodb://localhost:27017/request', options);
var grid = mongoose.createConnection('mongodb://localhost:27017/map_edges_storage', options);
var Factory = new mongoscheme.Factory(mongoose.Schema, grid, requestDB);
var createSchemas = Factory.createSchemas();
var crawler = require('./Crawler.js');
var crawlerFunc = new crawler.Crawler(Factory, mongoscheme);

//Factory.getNode({}, {});
crawlerFunc.main();
setInterval(function () { crawlerFunc.main(); }, 30 * 60 * 1000);

var app = express();

// Using JSON parser
app.use(bodyParser.json());

// Serve Public Static
app.use(express.static('public'));

// Functions

app.post('/Request', function (req, res) {
    console.log("Teste");
    var mapEdgeEntry = new mongoscheme.RequestHist({
        destination: {
            lat: req.body.destination.lat.toFixed(7),
            lng: req.body.destination.lng.toFixed(7)
        },
        origin: {
            lat: req.body.origin.lat.toFixed(7),
            lng: req.body.origin.lng.toFixed(7)
        },
        complete: req.body.complete,
        lastRequest: req.body.lastRequest
    });
    mapEdgeEntry.save(function (err, data) {
        if (err) {
            return console.log("failed edge");
        }
        else {
            console.log("inserted edge");
            //console.log(edge.distance);
            console.log(data);
            if (!crawler.last) {
                crawler.last = data;
            }
        }
    });
});

app.post('/mapDirection', function (req, res) {
    saveMap(req.body, mongoscheme, function (error, data) {
        if (error) {
            return res.status(500).send(error).end();
        }
        return res.status(data).end();
    });
});

// Listen
app.listen(3000, function () {
    console.log('FYDP app listening on port 3000!');
});


var saveMap = function (req, mongo, callback) {
    var error = "";
    var time = Date.now();
    var parse = req;
    if (parse.status == "OK") {
        var parsed = req.routes[0].legs[0].steps;
        for (var i = 0; i < parsed.length; i++) {
            var edge = parsed[i];
            //console.dir(edge);
            if (i == 0) {
                var startNode = new mongo.MapNode({
                    location: {
                        lat: Number(edge.start_location.lat).toFixed(7),
                        lng: Number(edge.start_location.lng).toFixed(7)
                    }
                });
                startNode.save(function (err, startNode) {
                    if (err) {
                        error += "Request Database Error ";
                    }
                });
            }
            var mapEdgeEntry = new mongo.MapEdge({
                destination: {
                    lat: Number(edge.end_location.lat).toFixed(7),
                    lng: Number(edge.end_location.lng).toFixed(7)
                },
                origin: {
                    lat: Number(edge.start_location.lat).toFixed(7),
                    lng: Number(edge.start_location.lng).toFixed(7)
                },
                distance: {
                    text: edge.distance.text,
                    value: Number(edge.distance.value)
                },
                duration: [{
                    text: edge.duration.text,
                    value: Number(edge.duration.value)
                }]
            });
            var endNode = new mongoscheme.MapNode({
                location: {
                    lat: Number(edge.end_location.lat).toFixed(7),
                    lng: Number(edge.end_location.lng).toFixed(7)
                }
            });
            if (time) mapEdgeEntry.start_time = time;
            mapEdgeEntry.save(function (err, mapEdgeEntry) {
                if (err) {
                    error += "Map Edge Database Error ";
                }
            });
            endNode.save(function (err, endNode) {
                if (err) {
                    error += "Map Node Database Error";
                }
            });
        };
        if (error != "") {
            return callback(error)
        }
        return callback(undefined, 200);
    }
};