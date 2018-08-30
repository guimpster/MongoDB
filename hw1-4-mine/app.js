var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    bodyParser = require('body-parser'),
    util = require('util');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true })); 

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    app.post('/movies', function(req, res, next) {
        var movie = req.body.movie;
        var movies = JSON.parse(req.body.movies);

        console.log(util.inspect(movies));

        if (!movie || typeof movie == {} || !movie.title || movie.title == "" || !movie.year || movie.year == "" || !movie.imdb || movie.imdb == "") {
            return res.render("movies", {error: 'Please, all fields are required.', movie: movie, movies: movies});
        }

        db.collection('movies').insertOne(movie, function(err, result) {
            assert.equal(null, err);

            console.log('Inserted document: ', Object.assign({}, movie, {_id: result.insertedId}));
            res.redirect("/");
        });
    });

    app.get('/', function(req, res, next){
        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies', { 'movies': docs, 'movie': {} } );
        });
    });

    app.use(errorHandler);
    
    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });
});