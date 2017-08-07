const mongoose = require('mongoose');
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please supply name'
	},
	email: {
		type: String,
		unique: true,
		trim: true,
		lowercase: true,
		validator: [validator.isEmail, 'Invalid E-mail Address'],
		required: 'Please supply an E-mail address'
	}
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
UserSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', UserSchema);