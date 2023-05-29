const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser")

const { Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session,
    postSchema,
    Post } = require("../database.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        //check if there's a session. If not, render the loging main page.
        if (!req.cookies.session) {
            res.render('signup');
            return;
        }
        //try to get the current session from DB. If there's not, clear the useless cookie.
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.render('signup');
            return;
        }
        //try to find the user based on the session. If not found, clear the useless cookie
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.render('signup');
            return
        }
        // If it got here, it means that the user is authenticated and ready to go to personal profile page.
        res.redirect(`/profile/${currentUser.id}`);
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

router.post("/", async (req, res) => {
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


module.exports = router