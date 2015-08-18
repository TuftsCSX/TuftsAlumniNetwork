var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');
var passport = require('passport');
var form = require('express-form');
var field = form.field;
var request = require('request');
var loggedInAPI = require('./loggedIn').loggedInAPI;

var geocodeURI = 'https://maps.googleapis.com/maps/api/geocode/json?';

router.get('/facebook', passport.authenticate('facebook', {
    'scope': ['public_profile',],
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/could_not_login', 
}));

var newEntryForm = form (
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
            res.sendStatus(400);
        }
    });
}

/* Search the database for a job with the id 'oldJobID' and remove it */
function removeOldJob( oldJobID ) {
    if ( ! Boolean( oldJobID ) ) {
        /* Nothing to actually remove */
        return;
    }
    Alumni.findById( oldJobID, function( oldJobErr, oldJob ) {
        if ( oldJobErr ) {
            console.log( 'error finding old job' );
        } else if ( Boolean( oldJob ) ) {
            oldJob.remove( function( oldJobErr, oldJob ) {
                if ( oldJobErr ) {
                    console.log( 'error removing old job', oldJobErr );
                }
            });
        }
    });
}

/* Create a new entry with the data 'data', and attach it to the user 'user' */
function saveEntry( user, data, res ) {
    var alumni = new Alumni(data);
    alumni.save(function( err, newAlumni ) {
        if ( ! err ) {
            console.log( 'Old Job: ', user.job );
            var oldJobID = user.job;
            user.job = newAlumni._id;
            user.save( function( userErr ) {
                if ( ! userErr ) {
                    removeOldJob( oldJobID );
                    res.sendStatus(201);
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });
}

router.route( '/newEntry' )
    .post([loggedInAPI,  newEntryForm], function( req, res ) {
        if ( req.form.isValid) {
            var city = req.form.city;
            if ( Boolean( city ) ) {
                saveEntryWithCity( req.user, req.form, city, res );
            } else {
                saveEntry( req.user, req.form, res );
            }
        } else {
            res.sendStatus(400);
        }
    });

module.exports = router;
