const User = require('../models/home');
const dateFormat = require('dateformat');
const auth0 = require('../../config/auth0');

exports.loggedIn = function(req, res, next)
{
	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
}

exports.home = function(req, res) {
	res.render('index.ejs', {
		title : 'Auth0 integration',
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
	 });
}


exports.signup = function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}


exports.login = function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}


exports.signupPost = async (req, res) => {
	try {
		if (req.session.user) {
			res.redirect('/');
		} else {
			const user = await User.findOne({ 'email' :  req.body.email }).exec();
			if (user && user.email) {
				return res.render('signup', {
					error : req.flash('error', 'That email is already taken.'),
					success: req.flash("success"),
					session: req.session
				});
			}
			const userdata = await User.find().sort([['_id', 'descending']]).limit(1).exec();
	
			// register the user on auth0
			const data = {
				email: req.body.email.toLowerCase(),
				password: req.body.password,
				connection: process.env.AUTH0_CONNECTION,
			};
			const userAuthData = await auth0.database.signUp(data);
	
			// User not registered on auth0
			if (!userAuthData) {
				return res.render('signup', {
					error : req.flash("error", 'User not registered on auth0'),
					success: req.flash("success"),
					session: req.session
				});
			}
	
			// create the user
			const newUser = new User();
			// set the user's local credentials
			const day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
		
			newUser.email = req.body.email;
			newUser.password = 'Implemented on auth0';
			newUser.name = req.body.username;
			newUser.created_date = day;
			newUser.updated_date = day;
			newUser.status = 'active';
			newUser.auth_id = userAuthData._id;
			newUser._id = (userdata && userdata.length > 0) ? (userdata[0]._id + 1) : 1;
				
			// save the user
			newUser.save(function(err) {
				if (err) {
					return res.render('signup', {
						error : req.flash("error", err),
						success: req.flash("success"),
						session: req.session
					});
				}
				return res.render('signup', {
					error : req.flash("error"),
					success: req.flash("success", 'Account Created Successfully'),
					session: req.session
				});
				req.session.destroy();
			});
		}
	} catch (err) {
		return res.render('signup', {
			error : req.flash("error", err),
			success: req.flash("success"),
			session: req.session
		});
	}
}


exports.loginPost = async (req, res) => {
	try {
		if (req.session.user) {
			res.redirect('/');
		} else {
			const user = await User.findOne({ 'email' :  req.body.email }).exec();
			// if there are any errors, return the error
			if (typeof user === 'undefined' || user === null) {
				return res.render('login', {
					error : req.flash("error", 'Oops something went wrong'),
					success: req.flash("success"),
					session: req.session
				});
			}
	
			// check to see if theres already a user with that email
			if (user) {
				if (user.status === 'inactive') {
					return res.render('login', {
						error : req.flash("error", 'Your account is not activated, please contact to your administrator.'),
						success: req.flash("success"),
						session: req.session
					});
				}
	
				// Auth0 Authentication
				const auth0Values = {
					grant_type: process.env.AUTH0_GRANT_TYPE,
					username: req.body.email,
					password: req.body.password,
					realm: process.env.AUTH0_CONNECTION,
					scope: process.env.AUTH0_SCOPE,
				};
		
				// Auth0 Login Request
				const userAuthData = await auth0.oauth.passwordGrant(auth0Values);
		
				if (!userAuthData) {
					return res.render('login', {
						error : req.flash("error", 'Invalid email or password'),
						success: req.flash("success"),
						session: req.session
					});
				}
	
				user.id_token = userAuthData.id_token;
				req.session.user = user;
				req.session.save();
	
				res.redirect('/');
			} else {
				return res.render('login', {
					error : req.flash("error", 'Invalid email or password.'),
					success: req.flash("success"),
					session: req.session
				});
			}
		}
	} catch (err) {
		return res.render('login', {
			error : req.flash("error", err),
			success: req.flash("success"),
			session: req.session
		});
	}
}
