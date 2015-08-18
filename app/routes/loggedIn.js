module.exports = { 
    loggedIn: function loggedIn( redirectTo ) {
        return function ( req, res, next ) {
            if ( req.user ) {
                return next();
            }
            res.redirect( redirectTo );
        };
    },
    loggedInAPI: function loggedInAPI( req, res, next ) {
        if ( req.user ) {
            return next();
        }

        res.sendStatus(401);
    }
};
