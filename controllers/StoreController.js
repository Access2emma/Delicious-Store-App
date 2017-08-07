const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const MulterOptions = {
	storage: multer.memoryStorage(),
	fileFilter(rep, file, next){
		const isPhoto = file.mimetype.startsWith('image/');

		if(isPhoto)
			return next(null, true);

		return next({message: 'The Uploaded file is not an image'}, false);
	}
}


module.exports.addStore = (req, res) => {

  res.render('edit-store', {
  	title: "Add Store"
  });

}

module.exports.getStores = async (req, res) => {
	const stores = await Store.find();

	res.render('stores', {
		title: 'Stores',
		stores
	});
}

module.exports.editStore = async (req, res) => {

	const store = await Store.findOne({_id: req.params.id});

	res.render('edit-store', {
		title: `Edit ${store.name}`,
		store
	});
}

module.exports.updateStore = async (req, res) => {
	// set the location data to be Point
	req.body.location.type = 'Point';

	// find the store and update
	const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true,
		runValidators: true
	}).exec();

	// redirect back to the store
	req.flash('success', 'Store successfully updated!');

	res.redirect(`/stores/${store.slug}`);
}

module.exports.upload = multer(MulterOptions).single('photo');

module.exports.resize = async (req, res, next) => {
	// skip if there is no uploaded file to work with
	if(! req.file)
		return next();

	const extention = req.file.mimetype.split('/')[1];

	req.body.photo = `${uuid.v4()}.${extention}`

	const photo = await jimp.read(req.file.buffer)

	await photo.resize(800, jimp.AUTO);

	await photo.write(`./public/uploads/${req.body.photo}`);

	next();
}

module.exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();

	req.flash('success', `Store Successfully Create: ${store.name}`);

	res.redirect(`/store/${store.slug}`);

}

module.exports.showStore = async (req, res, next) => {
	const store = await Store.findOne({slug: req.params.slug});
	if(!store)
		return next();

	res.render('store', {title: store.name, store});
}

module.exports.getStoreByTag = async (req, res) => {
	const title = req.params.tag;
	const tagQuery = title || { $exists: true}
	const tagsPromise = Store.getTagList();
	const storePromise = Store.find({tags: tagQuery});

	const [tags, stores] = await Promise.all([tagsPromise, storePromise]);

	res.render('tags', {
		title: `${title || 'Tags'}`,
		tags,
		stores
	});
}