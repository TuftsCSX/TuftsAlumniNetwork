var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var JobSchema = require('./alumni').schema;

/* A schema to represent a user that logged in from facebook */
var UserSchema = new Schema({
    oauthID: Number,
    name: String,
    job: { type: Schema.Types.ObjectId, ref: 'Alumni' } 
});

module.exports = mongoose.model('User', UserSchema);
