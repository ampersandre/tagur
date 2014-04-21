var mongoose = require('mongoose');

mongoose.model('Image', new mongoose.Schema({
    url: String,
    comments: [new mongoose.Schema({
        x: Number,
        y: Number,
        text: String,
        date: { type: Date, 'default': Date.now }
    })]
}));