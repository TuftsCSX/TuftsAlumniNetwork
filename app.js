/* App stuff */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');

/* Database */
var MONGO_URL = process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost/alumninetwork';
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);

/* Initialization */
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/static', express.static('public'));

/* Auth */
var auth = require('./app/auth');

/* Routes */
var router = require('./app/index')(app);
app.get('/', function(req, res) {
    var options = {
        root: __dirname + '/html/'
    };
    res.sendFile('index.html', options);
});


/* Startup */
app.listen(app.get('port'), function() {
    console.log('Node app is running at', app.get('port'));    
});

