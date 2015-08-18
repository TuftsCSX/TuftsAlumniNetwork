var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');
var User = require('./../models/user');

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

/*
router.route('/alumni/:alumni_id')
    .get( loggedIn( '/user/facebook' ), function(req, res) {
        Alumni.findById(req.params.alumni_id, function(err, alumn) {
            if (err) {
                res.send(err);
            } else {
                res.json(alumn);
            }
        });
    });
*/

module.exports = router;
