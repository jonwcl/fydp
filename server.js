// Dependencies
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

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
  res.send();
});

// Listen
app.listen(3000, function () {
  console.log('FYDP app listening on port 3000!');
});
