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
            res.render('login');
            return;
        }
        //try to get the current session from DB. If there's not, clear the useless cookie.
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.render('login');
            return;
        }
        //try to find the user based on the session. If not found, clear the useless cookie
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.render('login');
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
        // check if username entered exists in DB. If not, direct to main page. 
        const loginuser = await User.findOne({ username: req.body.username })
        if (!loginuser) {
            res.redirect('/login');
            return;
        }
        // validate the password.
        const validate = await bcrypt.compare(req.body.password, loginuser.password)
        if (!validate) {
            res.redirect('/login');
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


module.exports = router