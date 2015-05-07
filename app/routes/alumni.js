var express = require('express');
var router = express.Router();
var Alumni = require('./../models/alumni');

router.route('/alumni')
    .get(function(req, res) {
        Alumni.find(function(err, alumni) {
            if ( err ) {
                res.send(err);
            } else {
                var response = alumni.filter(function(alumn) {
                        return alumn.canContact;
                });
                res.json(alumni);
            }
        });
    });

router.route('/alumni/:alumni_id')
    .get(function(req, res) {
        Alumni.findById(req.params.alumni_id, function(err, alumn) {
            if (err) {
                res.send(err);
            } else {
                res.json(alumn);
            }
        });
    });

module.exports = router;
