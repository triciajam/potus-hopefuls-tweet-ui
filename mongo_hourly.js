use twit-candi

function objectIdWithTimestamp(timestamp) {
    // Convert string date to Date object (otherwise assume timestamp is a date)
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }

    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp/1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}

var date = Date.now();
// Find all documents created within the last half hour -- this will be the last batch we laoded
var TIME_DIFF = 20 * 60 * 1000; // 20 mins in milliseconds 
//var TIME_DIFF = 24 * 60 * 60 * 1000; // whole day in milliseconds 
var compdate = date - TIME_DIFF;

//result = db.tweets.find({ _id: { $gt: objectIdWithTimestamp('2015/10/14') } });
//var latest_docs = db.tweets.find({ _id: { $gt: objectIdWithTimestamp(compdate) } });
//latest_docs.count();

var nodates=db.tweets.find( { created_at2: { $exists: false } } )
nodates.count();

// now fix the dates - make a real mongodb date
//var cursor = db.tweets.find()
while (nodates.hasNext()) {
  var doc = nodates.next();
  db.tweets.update({_id : doc._id}, {$set : {created_at2 : new Date(doc.created_at)}});
}

// now get rid of records that are too old
//var TIME_DIFF_OLDEST = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds - 1000 * 60 sec/min * 60 min/hr * 24 hr/day * 7 days/week
//var oldest = date - TIME_DIFF_OLDEST;

//var del_res = db.tweets.remove( { "created_at2" : { "$lt" : oldest } });
//del_res.matched_count;