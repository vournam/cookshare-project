import express from "express";
import handlebars from 'hbs';
import exphbs from "express-handlebars";
import path from "path";
import session from "express-session";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import * as model from './model/model_pg.js';

// Create express server
const app = express();

// Templating Engine
app.engine('hbs', exphbs.engine({extname: 'hbs', defaultLayout: 'main', layoutsDir:__dirname + '/views/layouts'}));
app.set('view engine', 'hbs');

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Router
const router = express.Router();
//load the router 'routes' on '/'
app.use(router); 

// Homepage - non registered with /
router.route('/').get( (req,res) => {
    res.render('nonRegHome');
} );

// Homepage - non registered
router.route('/nonRegHome').get( (req,res) => {
    res.render('nonRegHome');
} );

// Homepage - registered
router.route('/regHome').get( (req,res) => {
    res.render('regHome');
} );

// Search - non registered
router.route('/nonRegSearch').get( (req,res) => {
    res.render('nonRegSearch');
} );

// Search - registered
router.route('/regSearch').get( (req,res) => {
    res.render('regSearch');
} );

// About - non registered
router.route('/nonRegAbout').get( (req,res) => {
    res.render('nonRegAbout');
} );

// About - registered
router.route('/regAbout').get( (req,res) => {
    res.render('regAbout');
} );

// Contact - non registered
router.route('/nonRegContact').get( (req,res) => {
    res.render('nonRegContact');
} );

// Contact - registered
router.route('/regContact').get( (req,res) => {
    res.render('regContact');
} );

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

// Port
const PORT = process.env.PORT || 3003
app.listen(PORT, ()=> {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});

