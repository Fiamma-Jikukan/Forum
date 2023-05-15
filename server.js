const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")

const username = "Fiamma";
const password = "IKilledThePope123";
const siteControl = { authenticated: false, message: "Please log in", wrong: false }


const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(app.locals.session_id);
    const { cookies } = req
    try {
        if (cookies.session_id === undefined) {
            siteControl.authenticated = false;
            console.log("please login");
            next()
        } else {
            if (cookies.session_id == app.locals.session_id) {
                siteControl.authenticated = true;
                console.log(1);
                console.log(cookies.session_id);
                console.log(app.locals.session_id);
            } else {
                siteControl.authenticated = false;
                console.log(2);
                console.log(cookies.session_id);
                console.log(app.locals.session_id);
            }
        }

    } catch {
        console.log("error");
        next();
    }
    console.log("the use thing");
    console.log(siteControl.authenticated);
    next()
})

// get requests
app.get("/", (req, res) => {
    res.render('index', siteControl);
})
// post requests
app.post("/login", async (req, res) => {
    try {
        app.locals.session_id = 0
        if (req.body.username === username && req.body.password === password) {
            const session_id = Math.floor(Math.random() * 1000000);
            res.cookie('session_id', session_id);
            app.locals.session_id = session_id
            console.log("this is the session id: " + app.locals.session_id);
            console.log("this is the session id: " + req.cookies.session_id);
            res.redirect('/');
        } else {
            console.log(req.cookies);
            alert("wrong username or password")
            res.render('index');
        }
    }
    catch (err) {
        res.redirect('/');
    }
})

app.post("/logout", async (req, res) => {
    try {
        await res.clearCookie('session_id');
        app.locals.session_id = 0
        console.log("Cookie cleared")
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
