var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');
var passport = require('passport');
var form = require('express-form');
var field = form.field;
var request = require('request');

var geocodeURI = 'https://maps.googleapis.com/maps/api/geocode/json?';

router.get('/facebook', passport.authenticate('facebook', {
    'scope': ['public_profile',],
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/could_not_login', 
}));


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
newEntryForm = form (
    /* General Fields */
   field('displayName').trim().entityEncode(),
   field('email').isEmail().entityEncode(),
   field('gradYear').isDate(),
   field('city').trim(),

   /* Industry Fields */
   field('companyName').trim().entityEncode(),
   field('jobTitle').trim().entityEncode(),
   field('jobWhat').trim().entityEncode(),

   /* Academia Fields */
   field('academiaWhere').trim().entityEncode(),
   field('academiaWhat').trim().entityEncode(),

   /* Other Fields */
   field('otherWhat').trim().entityEncode()
);

function saveEntryWithCity( user, data, city, res ) {
    var requestOptions = {
        uri: geocodeURI,
        qs: {
            address: city
        } 
    };
    request(requestOptions, function( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var locationData = JSON.parse(body).results[0].geometry.location;
            data.lat = locationData.lat;
            data.lng = locationData.lng;
            saveEntry( user, data, res);
        } else {
            res.sendStatus(402);
        }
    });
}

function saveEntry( user, data, res ) {
    var alumni = new Alumni(data);
    alumni.save(function( err ) {
        if ( ! err ) {
            user.job = alumni._id;
            user.save( function( userErr ) {
                if ( ! userErr ) {
                    res.sendStatus(201);
                } else {
                    res.sendStatus(402);
                }
            });
        } else {
            res.sendStatus(402);
        }
    });
    /*
    user.jobs.push(data);
    user.save(function( err ){
        if ( err ) {
        } else {
        }

    });
    */
}

router.route( '/newEntry' )
    .post( newEntryForm, function( req, res ) {
        if ( req.form.isValid) {
            var city = req.form.city;
            if ( Boolean( city ) ) {
                saveEntryWithCity( req.user, req.form, city, res );
            } else {
                saveEntry( req.user, req.form, res );
            }
        } else {
            res.sendStatus(402);
        }
    });

module.exports = router;
