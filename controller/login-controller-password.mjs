// Authentication
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

let userModel;
userModel = await import(`../model/${process.env.MODEL}/task-list-model-${process.env.MODEL}.mjs`)


export let showLogInForm = function (req, res) {
    res.render('login-password', {model: process.env.MODEL});
}

export let showRegisterForm = function (req, res) {
    res.render('register-password', {});
}

export let doRegister = function (req, res) {
    userModel.registerUser(req.body.username, req.body.password, (err, result, message) => {
        if (err) {
            console.error('registration error: ' + err);
            //FIXME: δε θα έπρεπε να περνάμε το εσωτερικό σφάλμα στον χρήστη
            res.render('register-password', { message: err });
        }
        else if (message) {
            res.render('register-password', message)
        }
        else {
            res.redirect('/signIn');
        }
    })
}

export let doLogin = function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated

    userModel.getUserByUsername(req.body.username, (err, user) => {
        if (user == undefined) {
            res.render('login-password', { message: 'Δε βρέθηκε αυτός ο χρήστης' });
        }
        else {
            const match = bcrypt.compare(req.body.password, user.password, (err, match) => {
                if (match) {
                    //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
                    req.session.loggedUserId = user.id;
                    //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/" 
                    const redirectTo = req.session.originalUrl || "/tasks";
                    // res.redirect("/");
                    res.redirect(redirectTo);
                }
                else {
                    res.render("login", { message: 'Ο κωδικός πρόσβασης είναι λάθος' })
                }
            })
        }
    })
}

export let doLogout = (req, res) => {
    //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
    req.session.destroy();
    res.redirect('/');
}

//Τη χρησιμοποιούμε για να ανακατευθύνουμε στη σελίδα /login όλα τα αιτήματα από μη συνδεδεμένους χρήστες
export let checkAuthenticated = function (req, res, next) {
    //Αν η μεταβλητή συνεδρίας έχει τεθεί, τότε ο χρήστης είναι συνεδεμένος
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    }
    else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if ((req.originalUrl === "/login") || (req.originalUrl === "/register")) {
            next()
        }
        else {
            //Στείλε το χρήστη στη "/login" 
            console.log("not authenticated, redirecting to /login")
            res.redirect('/login');
        }
    }
}

