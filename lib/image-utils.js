var assert = require('assert');
var mongoose = require('mongoose');
var Image = mongoose.model('Image');

function updateImage(image) {
    return new Promise((resolve, reject) => {
        try {
            assert(image.src || image.objectId, 'Caller must provide either an image source or an object id');
            assert(image.xP, 'Image must provide x-percentage for new comment');
            assert(image.yP, 'Image must provide y-percentage for new comment');
            assert(image.comment, 'Image must provide text for new comment');
        } catch (err) {
            err.status = 400;
            reject(err);
        }

        var query = {};
        var imageDetails = {};
        var newComment = { xP: parseFloat(image.xP), yP: parseFloat(image.yP), text: image.comment };
        if (image.objectId) {
            query._id = image.objectId;
        }
        else {
            query.src = image.src;
            imageDetails.url = image.src;
        }

        Image.findOneAndUpdate(query, {
            $set: imageDetails,
            $push: { comments: newComment }
        }, { upsert: true },
        function(err, updatedImage) {
            if (err) {
                err.status = 500;
                reject(err);
            } else {
                resolve(updatedImage);
            }
        });
    });
}

module.exports = {
    updateImage
};