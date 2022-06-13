import express from "express";
import handlebars from 'hbs';
import exphbs from "express-handlebars";
import path from "path";
import session from "express-session";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as model from './model/model_pg.mjs';

// Create express server
const app = express();

// Templating Engine
app.engine('hbs', exphbs.engine({extname: 'hbs', defaultLayout: 'main', layoutsDir:__dirname + '/views/layouts'}));
app.set('view engine', 'hbs');

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));


// Προσθήκη του express-session middleware
app.use(session({
    name: process.env.SESS_NAME,
    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunar", // κλειδί για κρυπτογράφηση του cookie
    resave: false, // δεν χρειάζεται να αποθηκεύεται αν δεν αλλάξει
    saveUninitialized: false, // όχι αποθήκευση αν δεν έχει αρχικοποιηθεί
    cookie: {
      maxAge: 2*60*60*1000, //TWO_HOURS χρόνος ζωής του cookie σε ms or process.env.SESSION_LIFETIME
      sameSite: true
    }
}));

const redirectHome = (req, res, next) => {
console.log('redirect...', req.session)
if (!req.session.userID) {
res.redirect('/');
} else {
next();
} };

// GET /nonRegAbout
app.get("/nonRegAbout", (req, res) => {
    console.log("GET /nonRegAbout session=", req.session);
    res.render("nonRegAbout");
  });

// GET /nonRegContact
app.get("/nonRegContact", (req, res) => {
    console.log("GET /nonRegContact session=", req.session);
    res.render("nonRegContact");
  });

  // GET /regAbout
app.get("/regAbout", (req, res) => {
    console.log("GET /regAbout session=", req.session);
    res.render("regAbout");
  });

// GET /regContact
app.get("/regContact", (req, res) => {
    console.log("GET /regContact session=", req.session);
    res.render("regContact");
  });

// GET /AddRecipe
app.get("/regAddRecipe", (req, res) => {
    console.log("GET /regAddRecipe, session=", req.session)
    res.render("regAddRecipe", { data: {} });
});

// POST /AddRecipe
app.post("/regAddRecipe", (req, res) => {
console.log("POST /regAddRecipe session=", req.session);
// const userID = req.session.userID;
// console.log(userID);
const newRecipe = {"title":req.body.title, "img":req.body.img, "ingredient":req.body.ingredient, "category":req.body.category, "description":req.body.description, "time":req.body.time, "portions":req.body.portions, "level":req.body.level } 
model.newRecipe(newRecipe,
    (err, data)=> {
    if (err)
        return console.error(err.message);
    else
    res.redirect("/regAllRecipes");
    }); 
});

// GET /edit/:recipe_id
app.get("/edit/:recipe_id", (req, res) => {
    console.log("GET /edit/:id session=", req.session);
    const id = req.params.recipe_id;
    if(id){
      console.log('edit', id)
      model.findRecipe(id, (err, row) => {
        if (err) {
          res.send(err);
        } else {
          console.log('get /edit/id recipe to edit', row[0]);
          res.render("regEditRecipe", { data: row[0] });
        }
      });
    }
  });
  
  // POST /edit/:recipe_id
  app.post("/regRecipeEdit/:id", (req, res) => {
    console.log("POST /regRecipeEdit/:id session=", req.session);
    const id = req.params.id;
    // const book = [req.body.title, req.body.author, req.body.comment, id];
    const recipe = {"title":req.body.title, "img":req.body.img, "ingredient":req.body.ingredient, "category":req.body.category, "description":req.body.description, "time":req.body.time, "portions":req.body.portions, "level":req.body.level}
    model.updateRecipe(recipe, (err, data) => {
      console.log('in POST', err, data)
      if(err){
        return console.error(err.message);
      }
      else {
        res.redirect("/regRecipeEdit/:id");
      }  
    });
  });
  
  // POST /delete/:recipe_id
  app.post("/delete/:id", (req, res) => {
    console.log("GET /delete/:id=", "session=", req.session);
    const id = req.params.id;
    model.deleteBook(id, (err, res) => {
      if (err) {
        return console.error(err.message);
      }
    })
    res.redirect("/regAllRecipes");
  });


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

// AllRecipes - registered
router.route('/regAllRecipes').get( (req,res) => {
    res.render('regAllRecipes');
} );

// Profile - registered
router.route('/regProfile').get( (req,res) => {
    res.render('regProfile');
} );

// My recipe - registered
router.route('/regMyRecipe').get( (req,res) => {
    res.render('regMyRecipe');
} );

// My recipe - registered
router.route('/regSaved').get( (req,res) => {
    res.render('regSaved');
} );

// Port
const PORT = process.env.PORT || 3003
app.listen(PORT, ()=> {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});

