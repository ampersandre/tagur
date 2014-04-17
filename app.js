var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser());
var mu = require ('mu2');
mu.root = __dirname + '/templates';
var mongoose = require('mongoose');
mongoose.connect('mongodb://ampersandre:password@ds049337.mongolab.com:49337/reddit');

var dbImage = mongoose.model('Image', new mongoose.Schema({
	url: String,
	comments: [new mongoose.Schema({
		x: Number,
		y: Number,
		text: String,
		date: { type: Date, 'default': Date.now }
	})]
}));


function saveImage(req, res, objectId) {
	if (!(req.body.hasOwnProperty('src') || objectId) ||
		!req.body.hasOwnProperty('x') || !req.body.hasOwnProperty('y') ||
		!req.body.hasOwnProperty('comment')) {
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect');
	}
	var query = {};
	var imageDetails = {};
	var newComment = { x: parseInt(req.body.x), y: parseInt(req.body.y), text: req.body.comment };
	if (objectId) { query._id = objectId; }
	else {
		query.url = req.body.src;
		imageDetails.url = req.body.src;
	}
	
	dbImage.findOneAndUpdate(query,
		{
			$set: imageDetails,
			$push: { comments: newComment }
		}, { upsert: true },
		function(err, image) {
			if (err) return console.error(err);
			res.send(image);
		});
}
app.post('/image', function(req, res) {
	saveImage(req, res);
});
app.post('/image/:id', function(req, res) {
	var objectId = req.params.id;
	saveImage(req, res, objectId);
});
app.get('/images', function(req, res) {
	dbImage.find(function(err,images) {
		if (err) return console.error(err);
		res.json(images);
	});
});
app.get('/image/:id', function(req, res) {
	var objectId = req.params.id;
	dbImage.find({_id: objectId}, function(err, image) {
		if (err) return console.error(err);
		res.json(image);
	});
});

app.get('/new', function(req, res) {
	mu.compileAndRender('new.html').pipe(res);
});
app.post('/new/:url', function(req, res) {
	var url = req.params.url;
	dbImage.find({url: url}, function(err, image) {
		if (err) return console.error(err);
		res.json(image);
	});
});

app.use(express.static(__dirname+'/public'));

app.listen(process.env.PORT || 8080);