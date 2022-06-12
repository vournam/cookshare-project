import express  from 'express'
import * as model from '../model/model_pg.mjs';
import dotenv from 'dotenv'

const router = express.Router();
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// //Για την υποστήριξη σύνδεσης/αποσύνδεσης χρηστών
// import * as logInController from '../controller/login-controller-password.mjs'
// //Αιτήματα για σύνδεση
// //Δείξε τη φόρμα σύνδεσης. Το 1ο middleware ελέγχει αν έχει γίνει η σύνδεση
// router.route('/signIn').get(logInController.checkAuthenticated, logInController.showLogInForm);

// // //Αυτή η διαδρομή καλείται όταν η φόρμα φτάσει με POST και διεκπεραιώνει τη σύνδεση
// router.route('/signIn').post(logInController.doLogin);

// //Αποσυνδέει το χρήστη
// router.route('/logout').get(logInController.doLogout);

// //Εγγραφή νέου χρήστη
// router.route('/register').get(logInController.checkAuthenticated, logInController.showRegisterForm);
// //FIXME θεωρεί πως POST στο /register ο χρήστης δεν είναι συνδεδεμένος
// router.post('/register', logInController.doRegister);

// Homepage - non registered
router.route('/').get( (req,res) => {
    res.render('nonRegHome');
} );

router.route('/nonRegHome').get( (req,res) => {
    res.render('nonRegHome');
} );

// // Search - non registered
// router.route('/nonRegSearch').get( (req,res) => {
//     res.render('nonRegSearch');
// } );

// // Search - registered
// router.route('/regSearch').get( (req,res) => {
//     res.render('regSearch');
// } );

// // About - non registered
// router.route('/nonRegAbout').get( (req,res) => {
//     res.render('nonRegAbout');
// } );

// // About - registered
// router.route('/regAbout').get( (req,res) => {
//     res.render('regAbout');
// } );

// // Contact - non registered
// router.route('/nonRegContact').get( (req,res) => {
//     res.render('nonRegContact');
// } );

// // Contact - registered
// router.route('/regContact').get( (req,res) => {
//     res.render('regContact');
// } );

// Sign-in
router.route('/signIn').get( (req,res) => {
    res.render('signIn');
} );

// Recipe - non registered
router.route('/nonRegRecipe').get( (req,res) => {
    res.render('nonRegRecipe');
} );

// Recipe - registered
router.route('/regRecipe').get( (req,res) => {
    res.render('regRecipe');
} );

//// Add recipe - registered
router.route('/regAddRecipe').get( (req,res) => {
    res.render('regAddRecipe');
} );

// Profile - registered
router.route('/regProfile').get( (req,res) => {
    res.render('regProfile');
} );

// My recipe - registered
router.route('/regMyRecipe').get( (req,res) => {
    res.render('regMyRecipe');
} );

export default router;