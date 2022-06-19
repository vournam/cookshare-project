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


// Add express-session middleware
app.use(session({
    name: process.env.SESS_NAME,
    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunar", // cookie encryption key
    resave: false, // does not need to be saved unless changed
    saveUninitialized: false, // no save if not initialized
    cookie: {
      maxAge: 2*60*60*1000, //TWO_HOURS cookie life time in ms or process.env.SESSION_LIFETIME
      sameSite: true
    }
}));

const redirectHome = (req, res, next) => {
if (!req.session.userID) {
res.redirect('/');
} else {
next();
} };

// GET /nonRegHome with /
app.get("/", (req, res) => {
    model.getAllRecipes( (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("nonRegHome", { data: rows });
    });
});

// GET /nonRegHome with /nonRegHome
app.get("/nonRegHome", (req, res) => {
    if(req.session.userID) {
        req.session.destroy();
    }
    model.getAllRecipes((err, rows) => {
      if (err) {
        return console.error(err.message);
      }
    //   console.log("nonReg feed...", rows)
      res.render("nonRegHome", { data: rows });
    });
});

// GET /AddRecipe
app.get("/regAddRecipe", (req, res) => {
    model.recipeInfo((err, category, ingredient, level) => {
    if (err) {
        return console.error(err.message);
    }
    res.render("regAddRecipe", { category: category, ingredient: ingredient, level: level });
    });
});

// POST /AddRecipe
app.post("/regAddRecipe", (req, res) => {
    if(req.session.userID) {
        console.log('post regAddrecipe')
        const newRecipe = {"title":req.body.title, "img":req.body.img, "ingredient":req.body.ingredient, "category":req.body.category, "description":req.body.description, "time":req.body.time, "portions":req.body.portions, "level":req.body.level } 
        model.newRecipe(newRecipe, req.session.userID,
        (err, data)=> {
            if (err)
                return console.error(err.message);
            else
                res.redirect("/regAllRecipes");
            });
    }
    else{
        res.redirect('/signIn');
    }
     
});

// GET /regAllRecipes
app.get("/regAllRecipes", (req, res) => {
    const userID = 1 || req.session.user_id;
    const userName = 'melCook' || req.session.alias;
    model.getMyRecipes(userID, (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
    //   console.log("recipes to show...", rows)
      res.render("regAllRecipes", { data: rows });
    });
});

// POST /nonRegSearch
app.post("/nonRegSearch", (req, res) => {
    // console.log("POST /nonRegSearch keys=", req.body.ingredient, req.body.category);
    const ingredient = req.body.ingredient.charAt(0).toUpperCase() + req.body.ingredient.slice(1);
    const category = req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);
    model.findRecipe(ingredient, category, (err, row) => {
    if (err) {
        res.send(err);
    } else {
        // console.log('post /nonRegSearch recipe to search', row);
        res.render("nonRegSearch", { data: row });
    }
    });
});

// POST /register
app.post("/register", (req, res) => {
    // console.log("POST /nonRegSearch keys=", req.body.name, req.body.surname, req.body.alias, req.body.email, req.body.password);
    const name = req.body.name;
    const surname = req.body.surname;
    const alias = req.body.alias;
    const email = req.body.email;
    const password = req.body.password;
    model.insertUser(name, surname, alias, email, password, (err, row) => {
        if (err) {
            res.send(err);
        } else {
            // console.log('post /nonRegSearch recipe to search', row);
            res.redirect("signIn");
        }
        });
});

// POST /signIn
app.post("/signIn", (req, res) => {
    // console.log("POST /signIn keys=", req.body.email, req.body.password);
    const email = req.body.email;
    const password = req.body.password;
    model.findUser(email, password, (err, row) => {
        if (err) {
            res.send(err);
        } else {
            console.log('post /signIn user', row);
            req.session.userID = row.user_id;
            req.session.save();
            console.log(req.session);
            res.redirect("/regHome");
        }
        });
});

// GET /regHome
app.get("/regHome", (req, res) => {
    if(req.session.userID) {
        model.getAllRecipes((err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        //   console.log("nonReg feed...", rows)
        const newRows = rows.filter( function(value) {
            return value.belongs_to_user_user_id != req.session.userID;
        })
        res.render("regHome", { data: newRows });
        });
    }
   else {
       res.redirect("/signIn");
    }
});

 // Profile - registered
 app.get("/regProfile", (req, res) => {
    if(req.session.userID) {
        model.loadUser(req.session.userID, (err, row) => {
            if (err) {
                res.send(err);
            } else {
                console.log('post /signIn user', row);
                model.getMyRecipes(req.session.userID, (err, recipes) => {
                    if (err) {
                        res.send(err);
                    } 
                    else {
                        res.render("regProfile", { user: row, data: recipes });
                    }
                })
                
            }
        });
    }
   else {
       res.redirect("/signIn");
   }
   
});

// My recipe - registered
app.get("/regMyRecipe", (req, res) => {
    if(req.session.userID) {
       model.openRecipe( req.query.id, (err,row) => {
            if (err) {
                res.send(err);
            } else {
                res.render("regMyRecipe", { image: row[0] });
            }
       })

    }
   else {
       res.redirect("/signIn");
   }
   
});


// GET /edit/:recipe_id
app.get("/edit/", (req, res) => {
    console.log("GET /edit/:id session=", req.session);
    if(req.session.userID){
        const id = req.query.id;
        console.log(id);
        model.openRecipe(id, (err,rows)=> {
            if(err){
                return console.error(err.message);
            }
            else {
                console.log(rows);
                model.recipeInfo((err,category, ingredient, level)=> {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        res.render('regEditRecipe', {data: rows[0], category: category, ingredient: ingredient, level: level });
                    }
                })
                
            }  
        })
    }
    else{
        res.redirect("/signIn");
    }
});
  
// POST /edit/:recipe_id
app.post("/regEditRecipe", (req, res) => {
    const recipe = {"title":req.body.title, "img":req.body.img, "ingredient":req.body.ingredient, "category":req.body.category, "description":req.body.description, "time":req.body.time, "portions":req.body.portions, "level":req.body.level}
    model.updateRecipe(recipe, req.body.id, (err, data) => {
      console.log('in POST', err, data)
      if(err){
        return console.error(err.message);
      }
      else {
        res.redirect("/regAllRecipes");
      }  
    });
});
  
// GET /delete/:recipe_id
app.get("/delete/", (req, res) => {
    if(req.session.userID){
        const id = req.query.id;
        console.log(id);
        model.deleteRecipe(id, (err, res) => {
            if (err) {
                return console.error(err.message);
            }
            else{
                res.redirect("/regHome");
            }
        })
    }
    else{
        redirect('/signIn');
    }
});

// Router
const router = express.Router();

app.use(router); 

// Recipe - non registered
router.route('/nonRegRecipe').get( (req,res) => {
    res.render('nonRegRecipe');
} );

// Recipe - registered
router.route('/regRecipe').get( (req,res) => {
    res.render('regRecipe');
} );

// My recipe - registered
router.route('/regSaved').get( (req,res) => {
    res.render('regSaved');
} );

// GET /nonRegAbout
app.get("/nonRegAbout", (req, res) => {
    res.render("nonRegAbout");
  });

// GET /nonRegContact
app.get("/nonRegContact", (req, res) => {
    res.render("nonRegContact");
  });

  // GET /regAbout
app.get("/regAbout", (req, res) => {
    res.render("regAbout");
  });

// GET /regContact
app.get("/regContact", (req, res) => {
    res.render("regContact");
  });

  // GET /regContact
app.get("/signIn", (req, res) => {
    res.render("signIn");
  });

// Port
const PORT = process.env.PORT || 3003
app.listen(PORT, ()=> {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});

