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
const { time } = require("console");


const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cookieParser());

// get requests
app.get("/", async (req, res) => {
    try {
        if (!req.cookies.session) {
            res.render('index');
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.render('index');
            return;
        }
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.render('index');
            return
        }
        res.redirect('/profile');
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.get("/profile", async (req, res) => {
    try {
        if (!req.cookies.session) {
            res.redirect('/')
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.redirect('/')
            return;
        }
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.redirect('/')
            return;
        }
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
        const signupUser = await User.findOne({ username: req.body.username })
        if (signupUser) {
            res.redirect('/');
            return;
        }
        var passRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        if(!passRegex.test(req.body.password)) {
            res.redirect('/');
            return;
        }
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
        const loginuser = await User.findOne({ username: req.body.username })
        if (!loginuser) {
            res.redirect('/');
            return;
        }
        const validate = await bcrypt.compare(req.body.password, loginuser.password)
        if (!validate) {
            res.redirect('/');
            return;
        }
        const newSession = await Session.create({
            user: loginuser.id,
            timeCreated: new Date()
        });
        res.cookie('session', newSession.id, { maxAge: 1000 * 60 * 60 * 24 });
        res.redirect('/');
    }
    catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/logout", async (req, res) => {
    try {
        const deleteSession = await Session.findByIdAndDelete(req.cookies.session)
        res.clearCookie('session');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    try {
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        // const deleteSession = await Session.deleteMany({})
        const deleteSession = await Session.deleteMany({ user: currentUser.id })
        res.clearCookie('session');
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
