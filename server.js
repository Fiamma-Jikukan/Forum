const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")

const { users, sessions } = require('./users')

const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cookieParser());

// get requests
app.get("/", (req, res) => {
    const { cookies } = req
    res.render('index', sessions[cookies.session_id]);
})
// post requests
app.post("/signup", async (req, res) => {

    users[req.body.username] = req.body.password;
    res.redirect('/');
})

app.post("/login", async (req, res) => {

    if (users[(req.body.username)]) {
        if (users[req.body.username] === req.body.password) {
            const session_id = Math.floor(Math.random() * 1000000);
            sessions[session_id] = { user: req.body.username }
            res.cookie('session_id', session_id);
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    } else {
        res.render('index', sessions);
    }


})

app.post("/logout", async (req, res) => {
    const { cookies } = req
    delete sessions[cookies.session_id]
    res.clearCookie('session_id');
    res.redirect('/');
})

// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
