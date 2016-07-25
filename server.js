// Dependencies
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');

var google = 'https://maps.googleapis.com/maps/api/directions/';
var googleAPIKey = 'AIzaSyDrCDc2H3nnU1Xzse6kLULKvwWGeRwUY_s';

var app = express();

// Using JSON parser
app.use(bodyParser.json());

// Serve Public Static
app.use(express.static('public'));

// Functions

app.post('/mapDirection', function (req, res) {
    console.log(req.body);
    var time = Date.now();

    if (!req.body || !req.body.origin || !req.body.destination) {
        res.writeHead(400);
        return res.end('Error');
    }
    else if (req.body.dTime && req.body.dTime < time) {
        return res.end('Error');
    }
    else if (!req.body.dTime) {
        req.body.dTime = time;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var goog = google;
    goog = goog + 'json?origin=' + req.body.origin;
    goog = goog + '&destination=' + req.body.destination;
    goog = goog + '&departure_time=' + req.body.dTime;
    goog = goog + '&key=' + googleAPIKey;

    request(goog, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage. 
            return res.end(body);
            

            //send to database
        }
        return res.end(error);
    });
});

// Listen
app.listen(3000, function () {
    console.log('FYDP app listening on port 3000!');
});
