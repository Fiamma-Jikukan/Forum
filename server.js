const http = require("http");
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt');
const { Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session } = require("./users.js");


const app = express();
// middleware
//setting up the looks using pug and css
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
// parsing the cookies
app.use(cookieParser());

// get requests
app.get("/", async (req, res) => {
    try {
        //check if there's a session. If not, render the loging main page.
        if (!req.cookies.session) {
            res.render('index');
            return;
        }
        //try to get the current session from DB. If there's not, clear the useless cookie.
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.render('index');
            return;
        }
        //try to find the user based on the session. If not found, clear the useless cookie
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.render('index');
            return
        }
        // If it got here, it means that the user is authenticated and ready to go to personal profile page.
        res.redirect('/profile');
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.get("/profile", async (req, res) => {
    try {
        //check if there's a session. If not, direct to the loging main page. In case someone try to get to profile page without authentication.
        if (!req.cookies.session) {
            res.redirect('/')
            return;
        }
        // check if session is in the database. If not, direct to main page. (the / will clear the cookie)
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.redirect('/')
            return;
        }
        // find user base on the session
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.redirect('/')
            return;
        }
        // if it got here it means the user is authenticated.
        res.render("profile", currentUser)
    } catch (err) {
        res.redirect('/')
    }
})

app.get("/error", async (req, res) => {
    res.render('error');
})

// post requests
app.post("/signup", async (req, res) => {
    try {
        // check to see if user already exists.
        const signupUser = await User.findOne({ username: req.body.username })
        if (signupUser) {
            res.redirect('/');
            return;
        }
        // check to see if password is at least medium.
        const passRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        if (!passRegex.test(req.body.password)) {
            res.redirect('/');
            return;
        }
        // hashing the password and creating a new user in the database.
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const newUser = User.create({
            username: req.body.username,
            password: hashedPass,
        });
        res.redirect('/');
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/login", async (req, res) => {
    try {
        // check if username entered exists in DB. If not, direct to main page. 
        const loginuser = await User.findOne({ username: req.body.username })
        if (!loginuser) {
            res.redirect('/');
            return;
        }
        // validate the password.
        const validate = await bcrypt.compare(req.body.password, loginuser.password)
        if (!validate) {
            res.redirect('/');
            return;
        }
        // create a new session in the database. 
        const newSession = await Session.create({
            user: loginuser.id,
            timeCreated: new Date()
        });
        // add cookie that holds the session. it will last one hour. (It will also be deleted from DB).
        res.cookie('session', newSession.id, { maxAge: 1000 * 60 * 60  });
        res.redirect('/');
    }
    catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/logout", async (req, res) => {
    try {
        // delete the session from DB when user logs out.
        const deleteSession = await Session.findByIdAndDelete(req.cookies.session)
        // clear the cookie.
        res.clearCookie('session');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    try {
        // find the session and user the user wants to delete.
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        // const deleteSession = await Session.deleteMany({}) // in case I want to remove all sessions from the DB at once.
        //delete all sessions of this user so that all devices he is conected to will be disconected.
        const deleteSession = await Session.deleteMany({ user: currentUser.id })
        res.clearCookie('session');
        // delete user from DB
        const deleteUser = await User.findOneAndDelete({ _id: currentUser.id })
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
