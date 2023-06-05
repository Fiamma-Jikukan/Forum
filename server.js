const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const ObjectId = require('mongoose').Types.ObjectId;
const {
    User,
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
    req.session = currentSession
    req.user = currentUser
    console.log(req.user);
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
        if (!req.user) {
            res.render('forum', { posts: posts });
            return;
        }
        res.render('forum', { user: req.user, posts: posts, admin: req.user.admin });
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
        const deleteSession = await Session.findByIdAndDelete(req.session.id)
        // clear the cookie.
        res.clearCookie('session');
        res.redirect('/');

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

app.post("/remove/:id", async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/');
            return;
        }
        if (req.params.id !== req.session.user && !req.user.admin ) {
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
