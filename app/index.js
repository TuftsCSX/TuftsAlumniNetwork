module.exports = function(app) {
    app.use('/api', require('./routes/alumni'));
};
