var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;    

function insert(col,data){
  MongoClient.connect('mongodb://127.0.0.1:27017/colorDB', function(err, db) {
    if(err) throw err;
    var collection = db.collection(col);
    collection.insert(data, function(err, docs) {
        db.close();
    });
  })
}

//if found, update. Otherwise, insert the new item.
function update(col,selector,newdata){
  MongoClient.connect('mongodb://127.0.0.1:27017/colorDB', function(err, db) {
    if(err) throw err;
    var collection = db.collection(col);
    collection.update(selector, newdata ,{upsert:true}, function(err, docs) {
        db.close();
    });
  })
}

function updateAdd(col,selector,newdata){
  MongoClient.connect('mongodb://127.0.0.1:27017/colorDB', function(err, db) {
    if(err) throw err;
    var collection = db.collection(col);
    collection.update(selector, {$addToSet:{contacts:newdata}}, {upsert:true}, function(err, docs) {
        db.close();
    });
  })
}

function find(col,selector,fields,callback){
  MongoClient.connect('mongodb://127.0.0.1:27017/colorDB', function(err, db) {
    if(err) throw err;
    var collection = db.collection(col);
    collection.find(selector, fields).toArray(function(err, results){
        callback(results);
        db.close();
    });
  });
}

exports.insert = insert;
exports.update = update;
exports.updateAdd = updateAdd;
exports.find = find;
