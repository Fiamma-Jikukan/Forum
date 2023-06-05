const http = require("http");
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
require('dotenv').config()
const cookieParser = require("cookie-parser")
const ObjectId = require('mongoose').Types.ObjectId;
const { Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session,
    Post } = require("./database.js");
const post = require("./routes/post.js");
const login = require("./routes/login.js");
const signup = require("./routes/signup.js");
const profile = require("./routes/profile.js");


const app = express();
// middleware
//setting up the looks using pug and css
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
// parsing the cookies
app.use(cookieParser());

app.use(async (req, res, next) => {
    if (!req.cookies.session) {
        next()
        return;
    }
    const currentSession = await Session.findById(req.cookies.session);
    if (!currentSession) {
        res.clearCookie('session');
        next()
        return;
    }
    const currentUser = await User.findById(currentSession.user);
    if (!currentUser) {
        res.clearCookie('session');
        next()
        return;
    }
    if (!currentUser.admin) {
        req.session = currentSession;
        next()
        return;
    }
    req.session = currentSession
    req.session.admin = true;
    next()
})

app.use('/profile', profile);
app.use('/post', post);
app.use('/login', login);
app.use('/signup', signup);

// get requests
app.get("/", async (req, res) => {
    try {
        const findPosts = await Post.find({})
        const posts = findPosts.map(item => {
            return {
                id: item.id,
                title: item.title,
                time: item.created,
                user: item.user.name
            }
        }).reverse()
        if (!req.session) {
            res.render('forum', { posts: posts });
            return;
        }
        const currentUser = await User.findById(req.session.user);
        res.render('forum', { user: currentUser, posts: posts, admin: req.session.admin });
    } catch (err) {
        res.redirect('/error')
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

app.post("/remove/:id", async (req, res) => {
    try {
        if (!req.session) {
            res.redirect('/');
            return;
        }
        const currentUser = await User.findById(req.session.user);
        if (req.params.id !== req.session.user && !req.session.admin ) {
            res.redirect('/');
            return;
        }
        // const deleteSession = await Session.deleteMany({}) // in case I want to remove all sessions from the DB at once.
        const deleteSession = await Session.deleteMany({ user: req.params.id })
        // delete user from DB
        const deleteUser = await User.findOneAndDelete({ _id: req.params.id })
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})



// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
