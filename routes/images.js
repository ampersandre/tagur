var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose');
var Image = mongoose.model('Image');
var imageUtils = require('../lib/image-utils');

var multer = require('multer');
var upload = multer({ dest: './public/uploads/' });


/* /images */
router.get('/', function(req, res) {
    Image.find({}, function(err, images) {
        res.json(images);
    });
});

router.post('/', function(req, res) {
    imageUtils.saveImage(req, res);
});


/* /images/upload */
router.post('/upload', upload.single('uploadedImage'), function(req, res) {
    console.log('the file', req.file);
    var imageBits = fs.readFileSync(req.file.path);
    // convert binary data to base64 encoded string
    var base64Image = new Buffer(imageBits).toString('base64');
    request({
        url: 'https://api.imgur.com/3/image.json',
        method: 'POST',
        form: { image: base64Image },
        headers: { 'Authorization': 'Client-ID 2964e421ec33193' }
    },function(error, response, body){
        res.render('image', {src: JSON.parse(body).data.link});
        fs.unlink(req.file.path);
    });
});


/* /images/:id */
router.get('/:id', function(req, res) {
    var objectId = req.params.id;
    Image.findById(objectId, function(err, image) {
        res.render('image', { image: image });
    });
});

router.post('/:id', function(req, res) {
    var objectId = req.params.id;
    imageUtils.saveImage(req, res, objectId);
});


module.exports = router;
