var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var AlumniSchema = new Schema({
    name: String,
    company: String,
    jobTitle: String,
    type: String,
    email: String,
    city: String,
    lat: Number,
    lng: Number,
    start: Date,
    end: Date,
    canContact: Boolean,
    howContact: String,
    contact: String,
});

module.exports = mongoose.model('Alumni', AlumniSchema);
