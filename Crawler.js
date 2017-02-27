var googDir = 'https://maps.googleapis.com/maps/api/directions/';
var googLoc = 'https://maps.googleapis.com/maps/api/place/nearbysearch/';

var googleAPIKey = 'AIzaSyDrCDc2H3nnU1Xzse6kLULKvwWGeRwUY_s';
var APIKeys = ['AIzaSyDrCDc2H3nnU1Xzse6kLULKvwWGeRwUY_s', 'AIzaSyAsoK1pxNsjff_ae4hIJ5rwXk1voJla3qs', 'AIzaSyDPHk_lJHhFLJlgxWD5RuSNbLj4FP6QXcY', 'AIzaSyA1zyydvfPFqTnvgp-hx_rczkcJHRXs_mE', 'AIzaSyDOrKlDiLd-93OJw2nFSAhahHc-50gS2eg'];
var request = require('request');
var fs = require('fs');
const mongoose = require('mongoose');
var waterloo = { lat: 43.4642578, lng: -80.5204096 };
var toronto = { lat: 43.6532260, lng: -79.3831843 };
var apiCount = 0;

var crawler = function (Factory, mongo) {
    this.Factory = Factory;
    this.Mongo = mongo;
    this.last = null;
    this.main = function () {
        console.log("this.last");
        var goog = googDir;
        var count = 0;
        var complete = 0;
        var apiCount = 0;
        goog = goog + 'json?origin=' + waterloo.lat + ", " + waterloo.lng;
        goog = goog + '&destination=' + toronto.lat + ", " + toronto.lng;
        goog = goog + '&alternatives=true';
        goog = goog + '&departure_time=' + Date.now();
        goog = goog + '&key=' + googleAPIKey;

        request(goog, function (error, response, body) {
            if (error || response.statusCode != 200) {
                return console.log(error);
            }
            
            var newerror = "";
            var time = Date.now();
            var parse = JSON.parse(body);
            if (parse.status != "OK") {
                return console.log("Status not OK");
            }
            var parsedBody = JSON.parse(body);

            for (var j = 0; j < parsedBody.routes.length; j++){
                var parsed = parsedBody.routes[j].legs[0].steps;
                var duration = parsedBody.routes[j].legs[0].duration.value;
                var realDuration = parsedBody.routes[j].legs[0].duration_in_traffic.value;
                count += parsed.length + 1;

                for (var i = 0; i < parsed.length; i++) {
                    var edge = parsed[i];
                    if (i == 0) {
                        checkNode({
                            location: {
                                lat: Number(edge.start_location.lat).toFixed(7),
                                lng: Number(edge.start_location.lng).toFixed(7)
                            }
                        }, Factory, mongo, function (err, data) {
                            complete++;
                            if (err) {
                                newerror += err;
                            }
                            if (complete == count) {
                                var now = new Date(Date.now());
                                if (newerror != "") {
                                    return console.log("Error: " + newerror + " at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                                }
                                return console.log("Updated Request at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                            }
                        });
                    }

                    getAllEdges(edge, Factory, mongo, function (err, data) {
                        complete++;
                        if (err) {
                            newerror += err;
                        }
                        if (complete == count) {
                            var now = new Date(Date.now());
                            if (newerror != "") {
                                return console.log("Error: " + newerror + " at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                            }
                            return console.log("Updated Request at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                        }
                    });

                    /*checkEdge({
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
                            value: Number( (edge.duration.value / duration) * realDuration ).toFixed(0)
                        }],
                        start_time: [time]
                    }, Factory, mongo, function (err, data) {
                        complete++;
                        if (err) {
                            newerror += err;
                        }
                        if (complete == count) {
                            var now = new Date(Date.now());
                            if (newerror != "") {
                                return console.log("Error: " + newerror + " at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                            }
                            return console.log("Updated Request at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                        }
                    });*/
                    checkNode({
                        location: {
                            lat: Number(edge.end_location.lat).toFixed(7),
                            lng: Number(edge.end_location.lng).toFixed(7)
                        }
                    }, Factory, mongo, function (err, data) {
                        complete++;
                        if (err) {
                            newerror += err;
                        }
                        if (complete == count) {
                            var now = new Date(Date.now());
                            if (newerror != "") {
                                return console.log("Error: " + newerror +" at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                            }
                            return console.log("Updated Request at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                        }
                    });
                }
            }

            /*fs.writeFile("/tmp/test.txt", JSON.stringify(JSON.parse(body)), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });*/
        });
    }
}


function getAllEdges(edge, Factory, mongo, callback) {
    var goog = googDir;
    var waittime = Math.floor(Math.random() * (30*1000 - 1));
    setTimeout(function () {
        goog = goog + 'json?origin=' + edge.start_location.lat + ", " + edge.start_location.lng;
        goog = goog + '&destination=' + edge.end_location.lat + ", " + edge.end_location.lng;
        goog = goog + '&departure_time=' + Date.now();
        goog = goog + '&key=' + APIKeys[apiCount % (APIKeys.length)];
        apiCount += 1;

        request(goog, function (error, res, newbody) {
            if (error || res.statusCode != 200) {
                return console.log(error);
            }
            var time = Date.now();
            
            checkEdge({
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
                    text: JSON.parse(newbody).routes[0].legs[0].duration_in_traffic.text,
                    value: JSON.parse(newbody).routes[0].legs[0].duration_in_traffic.value
                }],
                start_time: [time]
            }, Factory, mongo, function (err, data) {
                if (err) {
                    return callback(err);
                }
                return callback(undefined, data);
            });
        });
    }, waittime);
}

/*var crawler = function (Factory, mongo) {
    this.Factory = Factory;
    this.Mongo = mongo;
    this.last = null;
    this.main = function () {
        console.log("Crawler");
        console.log(this.last);
        Factory.getRequest({ $where: search }, function (error, data) {
            if (error) {
                console.log(error);
            }

            var popular = findPopular(data);

            if (popular) {
                checkComplete(popular, Factory, mongo, function (error, data) {
                    if (error) {
                        return console.log(error);
                    }
                    if (data) {
                        popular.lastRequest.push(Date.now());
                        Factory.updateRequest(popular.id, {
                            complete: checkArray(popular.lastRequest),
                            lastRequest: popular.lastRequest
                        }, function (err, newdata) {
                            var now = new Date(Date.now());
                            last = newdata;
                            return console.log("Updated Request at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                        });
                    }
                    else {
                        var now = new Date(Date.now());
                        console.log("No new request saved at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                    }
                });
            }
            else if (this.last) {
                console.log("this.last");
                var goog = googDir;
                goog = goog + 'json?origin=' + last.origin.lat + ", " + last.origin.lng;
                goog = goog + '&destination=' + last.destination.lat + ", " + last.destination.lng;
                goog = goog + '&departure_time=' + Date.now();
                goog = goog + '&key=' + googleAPIKey;

                request(goog, function (error, response, body) {
                    if (error || response.statusCode != 200) {
                        return console.log(error);
                    }

                    var newerror = "";
                    var time = Date.now();
                    var parse = JSON.parse(body);
                    if (parse.status != "OK") {
                        return console.log("Status not OK");
                    }
                    var parsed = JSON.parse(body).routes[0].legs[0].steps;
                    calculateMiddle(last, parsed, mongo, Factory, function (err1, data) {
                        if (err1) {
                            return console.log(err1);
                        }
                        last = undefined;
                        var now = new Date(Date.now());
                        console.log("Request Expanded at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
                    });
                });
            }
            else {
                var now = new Date(Date.now());
                console.log("No request to update at " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
            }
        });
    }
}*/

function checkArray(lastRequest) {
    console.log("checkArray");
    var count = 0;
    var month = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    var check = [];
    for (var i = 0; i < 48; i++) {
        check.push(false);
    }
    for (var i = 0; i < lastRequest.length; i++) {
        var time = lastRequest[i];
        if (time > month) {
            var tempDate = time.getHours() + time.getMinutes() / 60;
            tempDate = Math.round(tempDate * 2);
            check[tempDate] = true;
        }
    }
    var complete = true;
    for (var i = 0; i < 48; i++) {
        if (check[i] == false) {
            complete = false;
        }
    }
    return complete;
}

function findPopular(data) {
    console.log("findPopular");
    if (Array.isArray(data)) {
        if (data.length == 1) {
            return data[0]
        }
        else {
            var count = 0;
            var most;
            for (var x = 0; x < data.length; x++) {
                var tempcount = 0;
                for (var y = 0; y < data.length; y++) {
                    if (x != y) {
                        if (data[x].origin.lat + 0.0001 > data[y].origin.lat && data[x].origin.lat - 0.0001 < data[y].origin.lat) {
                            if (data[x].origin.lng + 0.0001 > data[y].origin.lng && data[x].origin.lng - 0.0001 < data[y].origin.lng) {
                                tempcount++;
                            }
                        }
                    }
                }
                if (!most || tempcount > count) {
                    count = tempcount;
                    most = data[x];
                }
            }
            return most;
        }
    }

    return;
}

function checkComplete(req, Factory, mongo, callback) {
    console.log("checkComplete");
    var count ;
    var complete = 0;
    var notSaved = 0;
    var goog = googDir;
    goog = goog + 'json?origin=' + req.origin.lat + ", " + req.origin.lng;
    goog = goog + '&destination=' + req.destination.lat + ", " + req.destination.lng;
    goog = goog + '&departure_time=' + Date.now();
    goog = goog + '&key=' + googleAPIKey;

    request(goog, function (error, response, body) {
        if (error || response.statusCode != 200) {
            return callback(error);
        }

        var newerror = "";
        var time = Date.now();
        var parse = JSON.parse(body);
        if (parse.status != "OK") {
            return callback("Status not OK");
        }
        var parsed = JSON.parse(body).routes[0].legs[0].steps;
        count = parsed.length * 2 + 1;
        for (var i = 0; i < parsed.length; i++) {
            var edge = parsed[i];
            if (i == 0) {
                checkNode({
                    location: {
                        lat: Number(edge.start_location.lat).toFixed(7),
                        lng: Number(edge.start_location.lng).toFixed(7)
                    }
                }, Factory, mongo, function (err, data) {
                    complete++;
                    if (err) {
                        newerror += err;
                    }
                    if (!err && !data) {
                        notSaved++;
                    }
                    if (complete == count && notSaved == count) {
                        if (newerror == "") {
                            return callback(newerror);
                        }
                        calculateMiddle(req, parse.routes[0].legs[0].steps, mongo, Factory, function (err1, data) {
                            if (err1) {
                                return callback(err1);
                            }
                            return callback();
                        });
                    }
                    else if (complete == count) {
                        if (newerror != "") {
                            return callback(newerror);
                        }
                        return callback(undefined, "Added Nodes/Edges");
                    }
                });
            }
            checkEdge({
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
                }],
                start_time: [time]
            }, Factory, mongo, function (err, data) {
                complete++;
                if (err) {
                    newerror += err;
                }
                if (!err && !data) {
                    notSaved++;
                }
                if (complete == count && notSaved == count) {
                    calculateMiddle(req, parse.routes[0].legs[0].steps, mongo, Factory, function (err1, data) {
                        if (err1) {
                            return callback(err1);
                        }
                        return callback();
                    });
                }
                else if (complete == count) {
                    if (newerror != "") {
                        return callback(newerror);
                    }
                    return callback(undefined, "Added Nodes/Edges");
                }
            });
            checkNode({
                location: {
                    lat: Number(edge.end_location.lat).toFixed(7),
                    lng: Number(edge.end_location.lng).toFixed(7)
                }
            }, Factory, mongo, function (err, data) {
                complete++;
                if (err) {
                    newerror += err;
                }
                if (!err && !data) {
                    notSaved++;
                }
                if (complete == count && notSaved == count) {
                    calculateMiddle(req, parse.routes[0].legs[0].steps, mongo, Factory, function (err1, data) {
                        if (err1) {
                            return callback(err1);
                        }
                        return callback();
                    });
                }
                else if (complete == count) {
                    if (newerror != "") {
                        return callback(newerror);
                    }
                    return callback(undefined, "Added Nodes/Edges");
                }
            });
        }
    });
}

function checkNode(node, Factory, mongo, callback) {
    //console.log("checkNode");
    var check = {
        location: {
            lat: Number(node.location.lat),
            lng: Number(node.location.lng)
        }
    };
    Factory.getNode(check, function (error, data) {
        if (error) {
            return callback(error);
        }

        if (!data || data.length == 0) {
            var newNode = new mongo.MapNode(node);
            newNode.save(function (err, data) {
                if (err) {
                    return callback(err);
                }
                return callback(undefined, "New Node Saved");
            });
        }
        else { return callback(); }
    });
}

function checkEdge(edge, Factory, mongo, callback) {
    //console.log("checkEdge");
    var check = {
        destination: {
            lat: Number(edge.destination.lat),
            lng: Number(edge.destination.lng)
        },
        origin: {
            lat: Number(edge.origin.lat),
            lng: Number(edge.origin.lng)
        }
    };
    var edgeDate = new Date(edge.start_time[0]);
    var newEdgeTime = edgeDate.getHours() + edgeDate.getMinutes() / 60;
    Factory.getEdge(check, function (error, data) {
        if (error) {
            return callback(error);
        }
        if (data && Array.isArray(data) && data[0]) {
            var check = false;
            for (var i = 0; i < data[0].start_time.length; i++) {
                var oldEdgeTime = data[0].start_time[i].getHours() + data[0].start_time[i].getMinutes() / 60;
                var newer = new Date(edgeDate - 20 * 24 * 60 * 60 * 1000);
                if (oldEdgeTime > newEdgeTime - 0.25 && oldEdgeTime < newEdgeTime + 0.25 && data[0].start_time[i] > newer) {
                    check = true;
                }
            }
            if (!check) {
                data[0].start_time.push(edge.start_time[0]);
                data[0].duration.push(edge.duration[0]);
                var newEdge = new mongo.MapEdge(data[0]);
                Factory.updateEdge(data[0].id, data[0], function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(undefined, "An Edge Updated at a new time :" + newEdgeTime);
                });
            }
            else {
                return callback();
            }
        }
        else {
            var newEdge = new mongo.MapEdge(edge);
            newEdge.save(function (err, data) {
                if (err) {
                    return callback(err);
                }
                return callback(undefined, "New Edge Saved");
            });
        }
    });
}

function calculateMiddle(req, route, mongo, Factory, callback) {
    console.log("middle");
    if (req.expanded) {
        return callback(undefined, "Expanded Not Needed");
    }

    var total = 0;
    var distance = 0;
    var center;
    for (var i = 0; i < route.length; i++) {
        total += route[i].distance.value;
    }

    for (var i = 0; i < route.length; i++) {
        distance += route[i].distance.value;
        if (distance > total / 2) {
            center = route[i];
            i = route.length;
        }
    }
    var lat = center.start_location.lat + (center.end_location.lat - center.start_location.lat) / 2;
    var lng = center.start_location.lng + (center.end_location.lng - center.start_location.lng) / 2;

    var goog = googLoc;
    goog = goog + 'json?location=' + lat.toFixed(7) + ", " + lng.toFixed(7);
    goog = goog + '&radius=' + (total / 2).toFixed(0);
    goog = goog + '&key=' + googleAPIKey;

    request(goog, function (error, response, body) {
        if (error || response.statusCode != 200) {
            return callback(error);
        }
        var parse = JSON.parse(body);
        parse = parse.results;

        var newRequest = [];
        for (var i = 0; i < (parse.length > 25 ? 25 : parse.length) ; i++) {
            if ((req.origin.lat != parse[i].geometry.location.lat || req.origin.lng != parse[i].geometry.location.lng) &&
                distcalc(req.origin, parse[i].geometry.location) > 100) {
                newRequest.push({
                    destination: parse[i].geometry.location,
                    origin: req.origin,
                    complete: false
                });
            }
            if ((req.destination.lat != parse[i].geometry.location.lat || req.destination.lng != parse[i].geometry.location.lng) &&
                distcalc(req.destination, parse[i].geometry.location) > 100) {
                newRequest.push({
                    destination: req.destination,
                    origin: parse[i].geometry.location,
                    complete: false
                });
            }
        }
        Factory.RequestHist.create(newRequest, function (err, requests) {
            if (err) {
                return callback(err);
            }
            Factory.updateRequest(req.id, {
                expanded: true
            }, function (err, newdata) {
                return callback(undefined, "Added new Request to the database");
            });
        });
    });
}

function distcalc(start, end) {
    var R = 6371000; // metres
    var angle1 = start.lat * Math.PI / 180;
    var angle2 = end.lat * Math.PI / 180;
    var diff1 = (end.lat - start.lat) * Math.PI / 180;
    var diff2 = (end.lng - start.lng) * Math.PI / 180;

    var a = Math.sin(diff1 / 2) * Math.sin(diff1 / 2) +
            Math.cos(angle1) * Math.cos(angle2) *
            Math.sin(diff2 / 2) * Math.sin(diff2 / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
    //return Math.sqrt(Math.pow(start.lat - end.lat, 2) + Math.pow(start.lng - end.lng, 2));
}

module.exports.Crawler = crawler;