var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var graph = require('fbgraph');

/* User Auth */
var CLIENT_ID = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET;
var User = require('./models/user');
passport.use(new FacebookStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/user/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        graph.setAccessToken(accessToken);
        checkGroupForId('190739451019800/members/?fields=id&limit=1000', profile, done);
    }
));

function checkGroupForId(url, profile, done) {
    graph.get(url, function(err, res) {
        var found = false;
        res.data.forEach(function( member ) {
            if (member.id == profile.id ) {
                found = true;
            }
        });

        if ( found ) {
            userAllowed( profile, done );
        } else if ( res.paging.next ) {
            checkGroupForId( res.paging.next, profile, done ); 
        } else {
            done(null, false);
        }
   }); 
}

function userAllowed(profile, done) {
    User.findOne( { oauthID: profile.id }, function( err, user ) {
        if ( err ) { done( err ); }
        if ( user !== null ) {
            done( null, user );
        } else {
            var newUser = new User({
                oauthID: profile.id,
                name: profile.displayName,
                created: Date.now()
            } );
            newUser.save( function ( err ) {
                if ( err ) {
                    done( err );
                } else {
                    done ( null, newUser );
                }
            } );
        }
    });
}

passport.serializeUser( function ( user, done ) {
    done( null, user._id );
} );

passport.deserializeUser( function ( id, done ) {
    user.findById( id, function( err, user ) {
        if ( !err ) { 
            done( null, user ); 
        }
        else {
            done( err );
        }
    });
} );
