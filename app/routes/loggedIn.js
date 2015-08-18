module.exports = { 
    /* Create a middleware function that redirects to 'redirectTo if the 
     *   user is not logged in. Good for view methods
     */
    loggedIn: function loggedIn( redirectTo ) {
        return function ( req, res, next ) {
            if ( req.user ) {
                return next();
            }
            res.redirect( redirectTo );
        };
    },
    /* A middleware function that returns HTTPNotAuthorized if the user
     *   is not logged in
     */
    loggedInAPI: function loggedInAPI( req, res, next ) {
        if ( req.user ) {
            return next();
        }
        res.sendStatus(401);
    }
};
