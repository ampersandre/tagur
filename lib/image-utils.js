var mongoose = require('mongoose');
var Image = mongoose.model('Image');

function saveImage(req, res, objectId) {
    if (!(req.body.src || objectId) ||
        !req.body.xP || !req.body.yP ||
        !req.body.comment) {
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
            res.json(image);
        });
}

module.exports = {
    saveImage
};