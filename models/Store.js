const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const StoreSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	photo: String,
	tags: [String],
	created: {
		type: Date,
		default: Date.now
	},
	location: {
		type: {
			String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply a coordinates!'
		}],
		address: {
			type: String,
			required: 'You must supply an address!'
		}
	}
});

StoreSchema.statics.getTagList = function(){
	return this.aggregate([
		{ $unwind: '$tags'},
		{
			$group: {
				_id: '$tags',
				count: { $sum: 1 }
			}
		},
		{ $sort: {count: -1}}
	])
}

StoreSchema.pre('save', async function(next){
	if(!this.isModified('name')){
		return next();
	}

	this.slug = slug(this.name);

	const slugRegExp = new RegExp(`^(${this.slug})(-[0-9]*)?$`, 'i');

	const slugCount = await this.constructor.find({slug: slugRegExp});

	if(slugCount.length){
		this.slug = `${this.slug}-${slugCount.length+1}`
	}

	next();
});

module.exports = mongoose.model('Store', StoreSchema);