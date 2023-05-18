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
const MongoStore = require("connect-mongo")



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

app.get("/profile/:id", async (req, res) => {
    const { cookies } = req
    try {
        const currentSession = await Session.findById(cookies.session_id)
        const curentuser = await User.findOne({ username: currentSession.user })
        console.log(curentuser);
        console.log(curentuser.id);
        console.log(currentSession.id);
        if (req.params.id !== curentuser.id) {
            res.redirect(`/profile/${curentuser.id}`)
        } else {
            if (cookies.session_id) {
                res.render("profile", currentSession)
            } else {
                res.redirect('/')
            }
        }

    } catch (err) {
        res.redirect('/')
    }
})

app.get("/passing", async (req, res) => {
    const { cookies } = req
    const currentSession = await Session.findById(cookies.session_id)
    const curentuser = await User.findOne({ username: currentSession.user })
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
    const loginuser = await User.findOne({ username: req.body.username })
    try {
        if (loginuser) {
            const validate = await bcrypt.compare(req.body.password, loginuser.password)
            if (validate) {
                const newSession = await Session.create({
                    user: req.body.username,
                });
                res.cookie('session_id', newSession.id);
                console.log(loginuser.id);
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
        console.log(cookies.session_id);
        const currentSession = await Session.findById(cookies.session_id)
        const currentUser = currentSession.user
        console.log(currentUser);
        const deleteSession = await Session.deleteMany({ user: currentUser })
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
