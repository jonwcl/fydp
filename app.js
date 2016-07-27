var factory = function(Schema,mongoose) {
    this.Schema = Schema;
    this.mongoose = mongoose;
    this.MapEdge = null;
    this.MapNode = null;
    this.getEdge = null;
    this.getNode = null;
    this.createSchemas = function() {
        console.log('Creating Schemas');
        var MapEdge = new Schema({
            //take the steps only of the item
                             distance : {
                                text : String,
                                value : String
                             },
                             duration : {
                                text : String,
                                value : String
                             },
                             end_location : {
                                lat : String,
                                lng : String
                             },
                             start_location : {
                                lat : String,
                                lng : String
                             },
                             start_time : { type: Date, default: Date.now }


            });
        var MapNode = new Schema({
            location : {
                 lat : String,
                 lng : String
            }
        });
            this.MapEdge = mongoose.model('MapEdge',MapEdge);
            this.MapNode = mongoose.model('MapNode',MapNode);
            module.exports.MapEdge = this.MapEdge;
            module.exports.MapNode = this.MapNode;

    };

    this.getEdge = function(query,res) {
        this.MapEdge.find(query,function(error,output) {
            res.json(output);
        });
    };
    this.getNode = function(query,res){
        this.MapNode.find(query, function(error,output){
            res.json(output);
        });

    };

};

module.exports.Factory = factory;