var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

/*
 * displayName: Text
 * email: email
 * gradYear: date
 * city: text
 * 
 * companyName: text
 * jobTitle: text
 * jobWhat: text
 *
 * academiaWhere: text
 * academiaWhat: text
 *
 * otherWhat: text
 *
 * */
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
