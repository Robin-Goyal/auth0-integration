const home = require('../app/controllers/home');

//you can include all your controllers

module.exports = function (app, passport) {

    app.get('/login', home.login);
    app.get('/signup', home.signup);

    app.get('/', home.loggedIn, home.home);//home
    app.get('/index', home.loggedIn, home.home);//home
    app.get('/home', home.loggedIn, home.home);//home

    app.post('/signup', home.signupPost);
    app.post('/login', home.loginPost);
}
