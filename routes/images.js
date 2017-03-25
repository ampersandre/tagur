var express = require('express');
var router = express.Router();
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


/* /images/upload */
router.post('/upload', upload.single('image'), function(req, res) {
    console.log('the file', req.file);
    request({
        url: 'https://api.imgur.com/3/image.json',
        method: 'POST',
        form: { image: 'http://'+req.headers.host+'/uploads/'+req.files.uploadedImage.name },
        //form: { image: 'http://i.imgur.com/qrkXOA2.jpg' }, // for testing on localhost
        headers: { 'Authorization': 'Client-ID 2964e421ec33193' }
    },function(error, response, body){
        res.render('image', {src: JSON.parse(body).data.link});
        fs.unlink(req.files.uploadedImage.path);
    });
});


module.exports = router;
