var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
  this.db= new Db('event-in-area', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {comments: comment}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};

//getCollection

ArticleProvider.prototype.getCollection= function(callback) {
  this.db.collection('events', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

//findAll
ArticleProvider.prototype.findAll = function(callback, box) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
	    var start = new Date(2011, 1, 30);
		var end = new Date(2012, 2, 2);
	  
        //article_collection.find({"loc" : {"$within" : {"$box" : box}}}).toArray(function(error, results) {
        article_collection.find({"loc" : {"$within" : {"$box" : box}}, "dates": {"$gte": start, "$lt": end}}).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//findById

ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//save
ArticleProvider.prototype.insert = function(event, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {  
	    event.created_on = new Date();
		event.dates = [new Date(2012, 1, 1), new Date(2012, 1, 5), new Date(2012, 1, 6), new Date(2011, 1, 7)];
        event_collection.insert(event, function() {
          callback(null, event);
        });
      }
    });
};


//save
ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        article_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};

exports.ArticleProvider = ArticleProvider;
