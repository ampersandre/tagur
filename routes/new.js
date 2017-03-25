var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Image = mongoose.model('Image');

router.post('/', function(req,res) {
    if (!req.body.src) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }
    var src = req.body.src;
    console.log('the image src', src);
    Image.find({src: src}, function(err, images) {
        if (err) return console.error(err);
        res.render('image', { image: images[0], src: src, newImage: true });
    });
});

module.exports = router;
