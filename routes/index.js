var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var Image = mongoose.model('Image');
var fs = require('fs');

function mustache(res, template, params) {
    if (!params.partials) { params.partials = {}; }
    params.partials.forms = 'forms';
    params.partials.header = 'header';
    params.partials.footer = 'footer';
    res.render(template, params)
}

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
    request({
        url: 'https://api.imgur.com/3/image.json',
        method: 'POST',
        form: { image: 'http://'+req.headers.host+'/uploads/'+req.files.uploadedImage.name },
        //form: { image: 'http://i.imgur.com/qrkXOA2.jpg' }, // for testing on localhost
        headers: { 'Authorization': 'Client-ID 2964e421ec33193' }
    },function(error, response, body){
        mustache(res, 'image', {src: JSON.parse(body).data.link});
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
        mustache(res, 'image', { image: image });
    });
});
router.get('/images', function(req, res) {
    Image.find({}, function(err, images) {
        res.json(images);
    });
});
router.post('/new', function(req,res) {
    if (!req.body.hasOwnProperty('src')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }
    var src = req.body.src;
    Image.find({src: src}, function(err, image) {
        if (err) return console.error(err);
        mustache(res, 'image', { image: image, src: src });
    });
});

router.get('/', function(req, res) {
    Image.find().limit(6).exec(function(err, images) {
        mustache(res, 'index', { images: images });
    });
});

module.exports = router;
