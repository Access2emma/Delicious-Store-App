const express = require('express');

const router = express.Router();


const homeController = require('../controllers/homeController');
const StoreController = require('../controllers/StoreController');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(StoreController.getStores));

router.get('/stores', catchErrors(StoreController.getStores));
router.get('/stores/:id/edit', catchErrors(StoreController.editStore));
router.get('/store/:slug', catchErrors(StoreController.showStore))

router.get('/add', AuthController.isLoggedIn, StoreController.addStore);
router.post('/add', 
	StoreController.upload, 
	catchErrors(StoreController.resize), 
	catchErrors(StoreController.createStore));
router.post('/add/:id', 
	StoreController.upload, 
	catchErrors(StoreController.resize), 
	catchErrors(StoreController.updateStore));

router.get('/tags', catchErrors(StoreController.getStoreByTag));
router.get('/tags/:tag', catchErrors(StoreController.getStoreByTag));


router.get('/login', UserController.showLoginForm);
router.post('/login', AuthController.login);

router.get('/register', UserController.showRegistrationForm);
router.post('/register', 
	UserController.validateRegistration,
	UserController.register,
	AuthController.login
);

router.get('/logout', AuthController.logout);

router.get('/account', AuthController.isLoggedIn, UserController.account);
router.post('/account', catchErrors(UserController.updateAccount));
router.post('/account/forgot', catchErrors(AuthController.forgetPassword));
router.get('/account/reset/:token', catchErrors(AuthController.reset));
router.post('/account/reset/:token', 
	AuthController.confirmPassword,
	catchErrors(AuthController.updatePassword)
);

module.exports = router;
