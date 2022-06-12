import express from "express";
import handlebars from 'hbs';
import exphbs from "express-handlebars";
import path from "path";
import session from "express-session";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as model from '../model/model_pg.mjs';

// Create express server
const app = express();

// Templating Engine
app.engine('hbs', exphbs.engine({extname: 'hbs', defaultLayout: 'main', layoutsDir:__dirname + '/views/layouts'}));
app.set('view engine', 'hbs');

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// //Διαδρομές. Αντί να γράψουμε τις διαδρομές μας εδώ, τις φορτώνουμε από ένα άλλο αρχείο
// import routes from './routes/cookshare-routes.mjs'
// //και τώρα χρησιμοποιούμε αυτές τις διαδρομές
// app.use('/', routes);

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

// Port
const PORT = process.env.PORT || 3003
app.listen(PORT, ()=> {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});

// GET /about
app.get("/nonRegAbout", (req, res) => {
    console.log("GET /nonRegAbout session=", req.session);
    res.render("nonRegAbout");
  });

// GET /contact
app.get("/nonRegContact", (req, res) => {
    console.log("GET /nonRegContact session=", req.session);
    res.render("nonRegContact");
  });


// GET /create
app.get("/regAddRecipe", (req, res) => {
    console.log("GET /regAddRecipe, session=", req.session)
    res.render("regAddRecipe", { data: {} });
});

// POST /create
app.post("/regAddRecipe", (req, res) => {
console.log("POST /regAddRecipe session=", req.session);
// const userID = req.session.userID;
// console.log(userID);
const newRecipe = {"title":req.body.title, "img":req.body.img, "ingredient":req.body.ingredient, "description":req.body.description, "time":req.body.time, "portions":req.body.portions, "level":req.body.level } 
model.newRecipe(newRecipe,
    (err, data)=> {
    if (err)
        return console.error(err.message);
    else
    res.redirect("/regAllRecipes");
    }); 
});

// // GET /edit/:bookID
// app.get("/edit/:bookID", (req, res) => {
//     console.log("GET /edit/:id session=", req.session);
//     const id = req.params.bookID;
//     if(id){
//       console.log('edit', id)
//       model.findBook(id, (err, row) => {
//         if (err) {
//           res.send(err);
//         } else {
//           console.log('get /edit/id book to edit', row[0]);
//           res.render("edit", { data: row[0] });
//         }
//       });
//     }
//   });
  
//   // POST /edit/:bookID
//   app.post("/edit/:id", (req, res) => {
//     console.log("POST /edit/:id session=", req.session);
//     const id = req.params.id;
//     // const book = [req.body.title, req.body.author, req.body.comment, id];
//     const book = {"title":req.body.title, "author":req.body.author, "comment":req.body.comment, "bookID":id, "user": req.session.userID}
//     model.updateBook(book, (err, data) => {
//       console.log('in POST', err, data)
//       if(err){
//         return console.error(err.message);
//       }
//       else {
//         res.redirect("/books");
//       }  
//     });
//   });
  
//   // GET /delete/:bookID
//   app.get("/delete/:id", redirectHome, (req, res) => {
//     console.log("GET /delete/:id session=", req.session);
//     const id = req.params.id;
//     console.log("GET /delete/:id", id);
//     model.findBook(id, (err, row) => {
//       if (err) {
//         return console.error(err.message);
//       } 
//       console.log("TO BE DELETED...", row);
//       res.render("delete", { data: row[0] });
//     });
//     console.log('END of GET /delete/:id')
//   });
