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
app.post('/choosePath', function(req, response) {
    getOptimalPath(function (data){
        var optimal = data;

    console.log(JSON.stringify( optimal));
    var nodeDict = optimal["nodeDict"];
        console.log("nodeDict");
            console.log(nodeDict);
    var routes = req.body["routes"];
    console.log(routes);
    var chosenRoute = 0;
    var diff = optimal["path"].length * 2;
    var result = [];
    for (var i = 0; i < routes.length; i++) {
        var currDiff = compare(routes[i], optimal["path"]);
        if (currDiff < diff) {
            diff = currDiff;
            chosenRoute = i;
        }
        var res = {};
        res["path"] = routes[i];
        res["stats"] = getCostsAndTimes(nodeDict, routes[i]);
        res["totalTime"] = res["stats"]["times"].reduce((a, b) => a + b, 0);
        res["chosen"] = false;
        result.push(res);
    }

    result[chosenRoute]["chosen"] = true;
    response.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify({result});
    response.end(json);
});
    //return result;
})

app.post('/Request', function (req, res) {
    //console.log("Teste");

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
    var optimalPath = getOptimalPath();
    console.log(req.body);
    saveMap(req.body, mongoscheme, function (error, data) {
        if (error) {
            return res.status(500).send(error).end();
        }
        return res.status(data).end();
    });
});

app.get('/ping', function(req, res) {
    console.log('ping');
})

//var response = {};
function getOptimalPath(callback) {
    var nodeDict = {};
    var response = {};
    Factory.getNode({}, function(error, data) {
        for (var i = 0; i < data.length; i++) {
            var node = new Node(data[i]);
            nodeDict[node.nodeId] = node;
            //console.log(node.nodeId);

        }
        Factory.getEdge({}, function (error, data) {
            for (var i = 0; i < data.length; i++) {
                //for each edge, get the cost
                    var edge = new Edge(data[i], nodeDict);
                    edge.startNode.adjacent[edge.endNode.nodeId] = edge.cost;
                    edge.endNode.adjacent[edge.startNode.nodeId] = edge.cost;
                    edge.startNode.times[edge.endNode.nodeId] = edge.time;
                    edge.endNode.times[edge.endNode.nodeId] = edge.time;

            }
            var graph = new Graph();
            for (var key in nodeDict) {
                graph.addVertex(nodeDict[key].nodeId, nodeDict[key].adjacent);
            }
            //console.log(graph);

            //var waterloo = {location : { lat: 43.4642578, lng: -80.5204096 }};
            //var toronto = {location : { lat: 43.6532260, lng: -79.3831843 }};
            //var origin = nodeDict[getNodeKey(waterloo)];
            //var dest = nodeDict[getNodeKey(toronto)];
            //i picked random points that i actually have in my db....u can test it and do the same...
            var start = '43.4643018,-80.5204212';
            var end = '43.6533103,-79.3827675';
            //console.log(graph.shortestPath(origin.id, dest.id).concat([origin.id]).reverse());
            var optimalPath = graph.shortestPath(start, end).concat([start]).reverse();
            /*var costs = new Array();
            var times = new Array();
            for (var i = 0; i < optimalPath.length - 1; i++) {
                var start = optimalPath[i];
                var end = optimalPath[i + 1];
                var cost = nodeDict[start].adjacent[end];
                var time = nodeDict[start].times[end];
                costs.push(cost);
                times.push(time);
            }*/

            response["path"] = optimalPath;
            //response["costs"] = costs;
            //response["times"] = times;
            response["nodeDict"] = nodeDict;
            //console.log(response);
            return callback(response);
        })
        //return response;
    })
    // return response;
}

function getCostsAndTimes(nodeDict, path) {
    console.log("getCostsAndTimes");
    var costs = new Array();
    var times = new Array();
    for (var i = 0; i < path.length - 1; i++) {
                var start = path[i];
                var end = path[i + 1];
                console.log(start);
                console.log(nodeDict[start]);
                var cost = nodeDict[start].adjacent[end];
                var time = nodeDict[start].times[end];
                costs.push(cost);
                times.push(time);
    }
    var res = {};
    res["costs"] = costs;
    res["times"] = times;
    return res;
}

app.get('/getGraph', function(req, res) {
    return getOptimalPath();
})

function compare(optimalPath, googlePath) {
    var routes = googlePath.routes;
    //if (optimalPath.length != googlePath.length) return ;
    var countDifferences = 0;
    let set = new Set(optimalPath);
    for (var i = 0; i < googlePath.length; i++) {
        if(!set.delete(googlePath[i])) countDifferences++;
    }
    countDifferences += set.size;
    return countDifferences;
}

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
        console.log(parsed);
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





//put this in new file...




//dijkstra
function PriorityQueue () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority });
    this.sort();
  };
  this.dequeue = function () {
    return this._nodes.shift().key;
  };
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  this.isEmpty = function () {
    return !this._nodes.length;
  };
}

function Node (node) {
    this.nodeId = getNodeKey(node);
    this.adjacent = {};
    this.times = {};
    this.lat = node.location.lat;
    this.lng = node.location.lng;
}

function Edge (edge, nodeDict) {
    //this.edgeId = getStartNode(edge, nodeDict).id + "->" + getEndNode(edge, nodeDict).id;
    this.startNode = getStartNode(edge, nodeDict);
    this.endNode = getEndNode(edge, nodeDict);
    //this.edge = edge;
    this.time = getWorstCaseDuration(edge);
    this.cost = getCost(edge);//take the worst
}

function getCost (edge) {
    //X = u + Zo mean + variance
    var data = edge.duration;
    var distance = edge.distance.value;
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum += data[i].value;
    }
    var mean = sum / data.length;
    var varSum = 0;
    for (var i = 0; i < data.length; i++) {
        var diff = data[i].value - mean;
        varSum += diff * diff;
    }
    var variance = Math.sqrt(varSum / (data.length));
    var cost =  (mean + 1.282 * variance) / distance; //we want lower cost for lower time...
    //var cost = mean + 1.282 * variance;
    return cost;

}

function getWorstCaseDuration (edge) {
    var data = edge.duration;
    if (data.length == 0) return 0;
    var worst = data[0].value;
    for (var i = 1; i < data.length; i++) {
        worst = Math.max(data[i].value, worst);
    }
    return worst;
}

function getNodeKey(node) {
    return node.location.lat.toFixed(7) + "," + node.location.lng.toFixed(7);
}

function getStartNode(edge, nodeDict) {
    var key = edge.origin.lat.toFixed(7) + "," + edge.origin.lng.toFixed(7);
    return nodeDict[key];
}

function getEndNode(edge, nodeDict) {
    var key = edge.destination.lat.toFixed(7) + "," + edge.destination.lng.toFixed(7);
    return nodeDict[key];
}

/**
 * Pathfinding starts here
 */
function Graph(){
  var INFINITY = 1/0;
  this.vertices = {};

  this.addVertex = function(name, edges){
    this.vertices[name] = edges;
  };

  this.shortestPath = function (start, finish) {
    var nodes = new PriorityQueue(),
        distances = {},
        previous = {},
        path = [],
        smallest, vertex, neighbor, alt;

    for(vertex in this.vertices) {
      if(vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(0, vertex);
      }
      else {
        distances[vertex] = INFINITY;
        nodes.enqueue(INFINITY, vertex);
      }

      previous[vertex] = null;
    }

    while(!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if(smallest === finish) {
        path = [];

        while(previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }

        break;
      }

      if(!smallest || distances[smallest] === INFINITY){
        continue;
      }

      for(neighbor in this.vertices[smallest]) {
        alt = distances[smallest] + this.vertices[smallest][neighbor];

        if(alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          nodes.enqueue(alt, neighbor);
        }
      }
    }

    return path;
  };
}
