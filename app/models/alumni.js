var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

/* A schema to represent what an Alumni is up to now */
var AlumniSchema = new Schema({
    displayName: String,
    email: String,
    gradYear: Date,
    lat: Number,
    lng: Number,
    companyName: String,
    jobTitle: String,
    jobWhat: String,
    academiaWhere: String,
    academiaWhat: String,
    otherWhat: String
});

module.exports = mongoose.model('Alumni', AlumniSchema);
