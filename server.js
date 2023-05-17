const http = require("http");
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")

const { Schema,
    userSchema,
    User,
    users,
    sessions,
    connect,
    sessionSchema,
    Session } = require("./users.js")


const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cookieParser());

// get requests
app.get("/", async (req, res) => {
    const { cookies } = req
    try {
        const currentSession = await Session.findById(cookies.session_id)
        if (currentSession === null) {
            res.render('index', currentSession);
        } else {
            res.render('index', currentSession);
        }

    } catch (err) {
        res.render('error', { "error message": err })
    }
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
            const newUser = await User.create({
                username: req.body.username,
                password: req.body.password,
            });
            console.log("user added");
            res.redirect('/');
        }

    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/login", async (req, res) => {
    const loginuser = await User.findOne({ username: req.body.username })
    try {
        if (loginuser) {
            if (loginuser.password === req.body.password) {
                const newSession = await Session.create({
                    user: req.body.username,
                });
                res.cookie('session_id', newSession.id);
                res.redirect('/');

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
    const { cookies } = req
    try {
        const currentSession = await Session.findById(cookies.session_id)
        const deleteSession = await Session.findByIdAndDelete(currentSession.id)
        res.clearCookie('session_id');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    const { cookies } = req
    try {
        const currentSession = await Session.findById(cookies.session_id)
        const currentUser = currentSession.user
        const deleteSession = await Session.findOneAndDelete(currentSession.id)
        res.clearCookie('session_id');
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
