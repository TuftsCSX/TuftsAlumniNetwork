module.exports = function(app) {
    app.use('/api', require('./routes/alumni'));
    app.use('/user', require('./routes/user'));
};
