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
    try {
        if (!req.cookies.session) {
            res.render('index');
            return;
        }
        const currentUser = await User.findById(req.cookies.session.user);

        if (!currentUser) {
            res.clearCookie('session');
            res.render('index');
            return
        }
        res.redirect(`profile/${req.cookies.session.user}`);
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

app.get("/profile/:id", async (req, res) => {
    try {
        const tryingUser = await User.findById(req.params.id)
        if (!tryingUser) {
            res.redirect('/')
            return;
        }
        if (req.params.id !== req.cookies.session.user) {
            res.redirect('/')
            return;
        }
        res.render("profile", tryingUser)
    } catch (err) {
        res.redirect('/')
    }
})

app.get("/passing", async (req, res) => {
    const curentuser = await User.findOne({ _id: req.cookies.session.user })
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
        });
        res.cookie('session', newSession);
        res.redirect('/');


    }
    catch (err) {
        res.render('error', { "error message": err })
    }
})

app.post("/logout", async (req, res) => {
    try {
        const deleteSession = await Session.findByIdAndDelete(req.cookies.session._id)
        res.clearCookie('session');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    try {
        const deleteSession = await Session.deleteMany({ user: req.cookies.session.user })
        res.clearCookie('session');
        const deleteUser = await User.findOneAndDelete({ _id: req.cookies.session.user })
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
