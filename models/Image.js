var mongoose = require('mongoose');

mongoose.model('Image', new mongoose.Schema({
    src: String,
    date: { type: Date, 'default': Date.now },
    comments: [new mongoose.Schema({
        xP: Number,
        yP: Number,
        text: String,
        date: { type: Date, 'default': Date.now }
    })]
}));