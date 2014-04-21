var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Image = mongoose.model('Image');

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
        query.src = req.body.src;
        imageDetails.url = req.body.src;
    }

    Image.findOneAndUpdate(query,
        {
            $set: imageDetails,
            $push: { comments: newComment }
        }, { upsert: true },
        function(err, image) {
            if (err) return console.error(err);
            res.send(image);
        });
}
router.post('/image', function(req, res) {
    saveImage(req, res);
});
router.post('/image/:id', function(req, res) {
    var objectId = req.params.id;
    saveImage(req, res, objectId);
});
router.get('/image/:id', function(req, res) {
    var objectId = req.params.id;
    Image.find({_id: objectId}, function(err, image) {
        if (err) return console.error(err);
        res.json(image);
    });
});
router.get('/images', function(req, res) {
    Image.find({}, function(err, images) {
        res.json(images);
    });
});
router.post('/new', function(req,res) {
    console.log(req.body);
    if (!req.body.hasOwnProperty('src')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }
    Image.find({src: req.body.src}, function(err, image) {
        if (err) return console.error(err);
        res.json(image);
    });
});

router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
