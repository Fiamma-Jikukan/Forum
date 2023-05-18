const http = require("http");
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
require('dotenv').config()
const bcrypt = require('bcrypt');
const { Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session } = require("./users.js")
const MongoStore = require("connect-mongo")
const mongoose = require("mongoose")

const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000000000000 },
        store: MongoStore.create({
            mongoUrl: process.env.DATABASE
        })
    }))
app.use( async (req, res, next) => {
    console.log(req.session);
    const curentuser = await Session.find({})
    console.log(curentuser[0]);
    next()
})

// get requests
app.get("/", async (req, res) => {
    // const { cookies } = req
    try {
        // const currentSession = await Session.findById(cookies.session_id)
        if (req.session.user === undefined) {
            res.render('index')
        } else {
            res.render('index', req.session)

            // res.render('index', req.session.user);
        }
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.get("/profile/:id", async (req, res) => {
    try {
        const curentuser = await User.findOne({ username: req.session.user })
        if (req.params.id !== curentuser.id) {
            res.redirect(`/profile/${curentuser.id}`)
        } else {
            if (req.session.user) {
                res.render("profile", req.session)
            } else {
                res.redirect('/')
            }
        }

    } catch (err) {
        res.redirect('/')
    }
})

app.get("/passing", async (req, res) => {
    // const { cookies } = req
    // const currentSession = await Session.findById(cookies.session_id)
    const curentuser = await User.findOne({ username: req.session.user })
    res.redirect(`/profile/${curentuser.id}`);
})

app.get("/error", async (req, res) => {
    res.render('error');
})

// post requests
app.post("/signup", async (req, res) => {
    const signupUser = await User.findOne({ username: req.body.username })
    try {
        if (signupUser) {
            res.redirect('/');
        } else {
            const hashedPass = await bcrypt.hash(req.body.password, 10)
            const newUser = User.create({
                username: req.body.username,
                password: hashedPass,
            });
            console.log("user added");
            res.redirect('/');
        }

    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/login", async (req, res) => {
    try {
        const loginuser = await User.findOne({ username: req.body.username })
        if (loginuser) {
            const validate = await bcrypt.compare(req.body.password, loginuser.password)
            if (validate) {
                req.session.user = req.body.username
                // const newSession = await Session.create({
                //     user: req.body.username,
                // });
                // res.cookie('session_id', newSession.id);
                res.redirect(`/profile/${loginuser.id}`);
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/logout", async (req, res) => {
    // const { cookies } = req
    try {
        req.session.destroy()
        console.log("reach?");
        // const currentSession = await Session.findById(cookies.session_id)
        // const deleteSession = await Session.findByIdAndDelete(currentSession.id)
        res.clearCookie('connect.sid');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    // const { cookies } = req
    try {
        const currentUser = req.session.user
        console.log(req.session.user);
        const deleteSession = await Session.deleteMany({ session: {user: currentUser} })
        req.session.destroy()
        const deleteUser = await User.findOneAndDelete({ username: currentUser })
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
