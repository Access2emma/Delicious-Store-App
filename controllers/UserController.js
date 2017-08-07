const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = require('../models/User');


module.exports.showLoginForm = (req, res) => {
	res.render('login', {title: 'Login Page'});
}

module.exports.showRegistrationForm = (req, res) => {
	res.render('register', {title: 'Registration Form'});
}

// validate all the registration form fields
module.exports.validateRegistration = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'The name field cannot be empty').notEmpty();
	req.checkBody('email', 'The E-mail specified is not a valid Email').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password cannot be empty').notEmpty();
	req.checkBody('confirm-password', 'Password not match').equals(req.body.password);

	const errors = req.validationErrors();

	if(errors){
		req.flash('error', errors.map(err => err.msg));
		res.render('register', {title: 'Registration Form', flashes: req.flash(), body: req.body});
		return;
	}

	next();
}