var factory = function(Schema, grid, request) {
    this.Schema = Schema;
    this.grid = grid;
    this.request = request;
    this.MapEdge = null;
    this.MapNode = null;
    this.getEdge = null;
    this.getNode = null;
    this.RequestHist = null;
    this.getRequest = null;
    this.updateRequest = null;
    this.createSchemas = function() {
        console.log('Creating Schemas');
        var MapEdge = new Schema({
            //take the steps only of the item
            distance: {
                text: String,
                value: Number
            },
            duration: {
                text: String,
                value: Number
            },
            end_location: {
                lat: Number,
                lng: Number
            },
            start_location: {
                lat: Number,
                lng: Number
            },
            start_time: { type: Date, default: Date.now }
        });
        var MapNode = new Schema({
            location : {
                lat: Number,
                lng: Number
            }
        });
        var RequestHist = new Schema({
            origin: {
                lat: Number,
                lng: Number
            },
            destination: {
                lat: Number,
                lng: Number
            },
            complete: { type: Boolean, default: false },
            lastRequest: [Date],
            expanded: { type: Boolean, default: false }
        });
        this.MapEdge = grid.model('MapEdge', MapEdge);
        this.MapNode = grid.model('MapNode', MapNode);
        this.RequestHist = request.model('RequestHist', RequestHist);
        module.exports.MapEdge = this.MapEdge;
        module.exports.MapNode = this.MapNode;
        module.exports.RequestHist = this.RequestHist;
    };

    this.getEdge = function(query,callback) {
        this.MapEdge.find(query, function (error, output) {
            if (error) {
                return callback(error);
            }
            return callback(undefined, output);
        });
    };

    this.getNode = function(query,callback){
        this.MapNode.find(query, function (error, output) {
            if (error) {
                return callback(error);
            }
            return callback(undefined, output);
        });
    };

    this.getRequest = function (query, callback) {
        this.RequestHist.find(query, function (error, output) {
            if (error) {
                return callback(error);
            }
            return callback(undefined, output);
        });
    }

    this.updateRequest = function (id, newData, callback) {
        this.RequestHist.findByIdAndUpdate(id, { $set: newData}, { new: true }, function (err, data) {
            if (err) return callback(err);
            callback(undefined, data);
        });
    }

    //this.getRequest = function (query, res, callback) {
    //    this.RequestHist.find(query, function (error, output) {
    //        if (res) {
    //            if (error) {
    //                return res.status(500).send(error).end();
    //            }
    //            return res.json(output);
    //        }
    //        if (error) {
    //            return { error: error };
    //        }
    //        console.log(output);
    //        return { data: output };
    //    });
    //}
};

module.exports.Factory = factory;