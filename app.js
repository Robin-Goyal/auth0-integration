const express = require('express');
const app = express();
const flash = require('connect-flash');
const dotenv = require('dotenv');
const port = process.env.PORT || 8042;
const path = require('path');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//set up our express application
app.use(cookieParser()); // read cookies (needed for auth)

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'Secret key 1234',
    resave: true,
    saveUninitialized: true
}));


app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./config/routes.js')(app); // load our routes and pass in our app


//launch ======================================================================
app.listen(port);
console.log('Application runs on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});
exports = module.exports = app;