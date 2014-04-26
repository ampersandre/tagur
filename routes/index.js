var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var Image = mongoose.model('Image');
var fs = require('fs');

function saveImage(req, res, objectId) {
    if (!(req.body.hasOwnProperty('src') || objectId) ||
        !req.body.hasOwnProperty('xP') || !req.body.hasOwnProperty('yP') ||
        !req.body.hasOwnProperty('comment')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }
    var query = {};
    var imageDetails = {};
    var newComment = { xP: parseFloat(req.body.xP), yP: parseFloat(req.body.yP), text: req.body.comment };
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
router.post('/image/upload', function(req, res) {
    console.log(req.files);
    console.log('http://'+req.headers.host+'/uploads/'+req.files.uploadedImage.name);
    request({
        url: 'https://api.imgur.com/3/image.json',
        method: 'POST',
        form: { image: 'http://'+req.headers.host+'/uploads/'+req.files.uploadedImage.name },
        //form: { image: 'http://i.imgur.com/qrkXOA2.jpg' }, // for testing on localhost
        headers: { 'Authorization': 'Client-ID 2964e421ec33193' }
    },function(error, response, body){
        res.json(JSON.parse(body));
        fs.unlink(req.files.uploadedImage.path);
    });
});
router.post('/image/:id', function(req, res) {
    var objectId = req.params.id;
    saveImage(req, res, objectId);
});
router.get('/image/:id', function(req, res) {
    var objectId = req.params.id;
    Image.findById(objectId, function(err, image) {
        res.render('index', { imageJson: image });
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
    Image.findById('5355dffad299fa214bbfd28e', function(err, image) {
        res.render('index', { imageJson: image, home: true });
    });
});

module.exports = router;
