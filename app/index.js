/* Set up the two basic routes necessary for the app */
module.exports = function(app) {
    app.use('/api', require('./routes/alumni'));
    app.use('/user', require('./routes/user'));
};
