const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

module.exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!'
});

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are successfully logged out!');

	res.redirect('/login');
}

exports.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}

	req.flash('warning', 'You must be authenticated!');
	res.redirect('/login');
}

exports.forgetPassword = async (req, res) => {
	// Check if the email exists in user model
	const user = await User.findOne({email: req.body.email});
	if(!user){
		req.flash('error', 'No account associated with the E-mail!');
		return res.redirect('/login');
	}

	// set the reset token on the user model
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + (60 * 60 * 1000); // one hour from now
	user.save();

	// email the user the password rest link
	const resetLink = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

	req.flash('success', `Password Reset Link has been sent to your E-mail. ${resetLink}`);

	// redirect to the login page with the message
	res.redirect('/login');
}

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});

	if(!user){
		req.flash('error', 'Password Reset Link is invalid or expired!');
		return res.redirect('/login');
	}

	res.render('reset', {title: 'Reset Password'});
}

exports.confirmPassword = (req, res, next) => {
	req.checkBody('password', 'Password cannot be empty').notEmpty();
	req.checkBody('confirm-password', 'Password not match').equals(req.body.password);

	const errors = req.validationErrors();

	if(errors){
		req.flash('error', errors.map(e => e.msg));
		return res.redirect('back');
	}

	next();
}

exports.updatePassword = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});

	if(!user){
		req.flash('error', 'Password Reset Link is invalid or expired!');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);

	// clear the password reset fields
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();

	// login the user
	await req.login(updatedUser);

	req.flash('success', 'Nice! Your password has been reset...');
	res.redirect('/');
}