var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    oauthID: Number,
    name: String
});

module.exports = mongoose.model('User', UserSchema);
