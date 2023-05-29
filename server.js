const http = require("http");
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")
const { Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session } = require("./database.js");
    const post = require("./routes/post.js");
    const login = require("./routes/login.js");
    const signup = require("./routes/signup.js");


const app = express();
// middleware
//setting up the looks using pug and css
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
// parsing the cookies
app.use(cookieParser());

app.use('/post', post);
app.use('/login', login);
app.use('/signup', signup);


// get requests
app.get("/", async (req, res) => {
    try {
         if (!req.cookies.session) {
            res.render('forum');
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.render('forum');
            return;
        }
        //try to find the user based on the session. If not found, clear the useless cookie
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.render('forum');
            return
        }
        res.render('forum', {user: currentUser});
    } catch (err) {
        res.redirect('/')
    }
    res.render("forum")
 })

app.get("/profile/:id", async (req, res) => {
    try {
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(req.params.id);
        if (!currentUser) {
            res.redirect('/')
            return;
        }
        // if it got here it means the user is authenticated.
       
        res.render(`profile`, {user: currentUser, session: currentSession})
    } catch (err) {
        res.redirect('/')
    }
})

app.get("/error", async (req, res) => {
    res.render('error');
})

// post requests
app.post("/logout", async (req, res) => {
    try {
        // delete the session from DB when user logs out.
        const deleteSession = await Session.findByIdAndDelete(req.cookies.session)
        // clear the cookie.
        res.clearCookie('session');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove", async (req, res) => {
    try {
        // find the session and user the user wants to delete.
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        // const deleteSession = await Session.deleteMany({}) // in case I want to remove all sessions from the DB at once.
        //delete all sessions of this user so that all devices he is conected to will be disconected.
        const deleteSession = await Session.deleteMany({ user: currentUser.id })
        res.clearCookie('session');
        // delete user from DB
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
