const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")

const { users, sessions } = require('./users')
const siteControl = { authenticated: false, message: "Please log in", wrong: false }


const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(users);
    const { cookies } = req
    try {
        if (cookies.session_id === undefined) {
            siteControl.authenticated = false;
            next()
        } else {
            if (sessions[cookies.session_id]) {
                siteControl.authenticated = true;
                siteControl.user = sessions[cookies.session_id.toString()]
            } else {
                siteControl.authenticated = false;
            }
        }
    } catch {
        next();
    }

    next()
})

// get requests
app.get("/", (req, res) => {
    res.render('index', siteControl);
})
// post requests
app.post("/signup", async (req, res) => {
    try{
        console.log("huh?");
        users[req.body.username] = req.body.password;
        res.redirect('/');

    } catch (err) {
        res.redirect('/');

    }
})

app.post("/login", async (req, res) => {
    try {
        if (users.hasOwnProperty(req.body.username)) {
            if (users[req.body.username] === req.body.password) {
                const session_id = Math.floor(Math.random() * 1000000);
                sessions[session_id] = req.body.username
                res.cookie('session_id', session_id);
                res.redirect('/');
            }
        } else {
            siteControl.failedUser = req.body.username
            siteControl.failedPass = req.body.password
            res.render('index', siteControl);
        }
    }
    catch (err) {
        res.redirect('/');
    }
})

app.post("/logout", async (req, res) => {
    try {
        res.clearCookie('session_id');
        res.redirect('/');
    }
    catch (err) {
        res.send('error');
    }
})

// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
