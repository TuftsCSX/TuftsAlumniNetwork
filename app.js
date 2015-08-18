/* App stuff */
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var passport = require('passport');
var loggedIn = require('./app/routes/loggedIn').loggedIn;
var loggedInAPI = require('./app/routes/loggedIn').loggedInAPI;

/* Database */
var MONGO_URL = process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost/alumninetwork';
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);

/* Auth */
var auth = require('./app/auth');

/* Initialization */
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser());
app.use(session({secret: process.env.SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/static', express.static('public'));
app.use( '/api', loggedInAPI );


/* Routes */
var router = require('./app/index')(app);
app.get('/', loggedIn('/user/facebook'), function(req, res) {
    var options = {
        root: __dirname + '/html/'
    };
    res.sendFile('index.html', options);
});


/* Startup */
app.listen(app.get('port'), function() {
    console.log('Node app is running at', app.get('port'));    
});

