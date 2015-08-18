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
        callbackURL: '/user/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        graph.setAccessToken(accessToken);
        checkGroupForId('190739451019800/members/?fields=id&limit=1000', profile, done);
    }
));

/* Recursively dig through all of a users groups to determine if they're a member of Tufts C.S. 
 * TODO: Consider just checking to see if they're a member of Tufts
 * url: The url for the next Facebook API call
 * profile: The profile of the current user
 * done: A passport callback to indicate the completion of authentication
 */
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

/* Called if a user is found to be allowed to login. 
 * Either finds the user in the database, or creates a new entry
 *      profile: The facebook profile of the user attempting to log in
 *      done: a passport callback to indicate that authentication is complete
 */
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

/* Tell passport how to serialize a user to the session
 *  Just serializes the user's id to keep the session object small
 */
passport.serializeUser( function ( user, done ) {
    done( null, user._id );
} );

/* Tell passport how to deserialize a user from the session 
 * Performs a database lookup on the serialized id from above
 */
passport.deserializeUser( function ( id, done ) {
    User.findById( id, function( err, user ) {
        if ( !err ) { 
            done( null, user ); 
        }
        else {
            done( err );
        }
    });
} );
