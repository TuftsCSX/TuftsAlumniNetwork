var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');
var User = require('./../models/user');

/**
 * Returns a list of Alumni objects, without their internal mongo _id or __v values
 * See models/alumni.js
 */
router.route('/alumni')
    .get( function(req, res) {
        Alumni.find({}, '-_id -__v', function(err, alumni) {
            if ( err ) {
                res.send(err);
            } else {
                var response = alumni.map( function( alumn ) {
                    return alumn;
                } );
                res.json(response);
            }
        });
    });

module.exports = router;
