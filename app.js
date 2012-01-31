var express = require('express');
var request = require('request');

var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var articleProvider = new ArticleProvider('localhost', 27017);

var app = express.createServer(
      express.logger()
    , express.bodyParser()
  );

app.set('view options', {
  layout: false
});
  
app.get('/', function(req, res){
  res.render('map.jade');
});

app.get('/test', function(req, res){
  box = [[23.984180084411605, 49.84132423017295], [24.052844635192855,  49.85405369355567]]; 
  articleProvider.findAll( function(error,docs){
    res.json(docs);
  }, box);
});

app.post('/insert', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/search', function(req, res){
  box = [
	[parseFloat(req.param('south_west_lng')), parseFloat(req.param('south_west_lat'))], 
	[parseFloat(req.param('north_east_lng')), parseFloat(req.param('north_east_lat'))]
  ]; 
  console.log('search in:');
  console.log(box);
  articleProvider.findAll( function(error,docs){
    console.log(docs);
    res.json(docs);
  }, box);
});

app.get('/import', function(req, res){
  request.get({url:'http://eventinarea.appspot.com/_s/event/', json:true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {			  
		  for(n in body.result) {
		    var event_json = body.result[n];
		    console.log('event_json');
		    console.log(event_json);
			var event = {
				'title': event_json['name'],
				'loc': {'lon': event_json['lng'], 'lat': event_json['lat']}
			};
			console.log('event');
			console.log(event);
            articleProvider.insert(event, function(error, docs) {
			  console.log('docs');
			  console.log(docs);
			});
		  }		  
		  res.json(body.result);
		}
    });
});

app.listen(3000);