var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');
var passport = require('passport');

router.get('/facebook', passport.authenticate('facebook', {
    'scope': ['public_profile',],
}));
router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/could_not_login', 
}));

module.exports = router;
