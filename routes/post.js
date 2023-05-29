const http = require("http");
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
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
        if (!req.cookies.session) {
            res.redirect('/');
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.redirect('/');
            return;
        }
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.clearCookie('session');
            res.redirect('/');
            return
        }
        res.render("newPost", currentUser)
    } catch (err) {
        res.redirect('/')
    }
})

router.get("/:id", async (req, res) => {
    try {
        const currentPost = await Post.findById(req.params.id);
        const maker = await User.findById(currentPost.user.id);
        console.log(maker);
        if (!req.cookies.session) {
            console.log("mega?");
            res.render("post", { post: currentPost, user: maker })
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        console.log(currentUser);
        if (!currentUser) {
            res.render("post", { post: currentPost, user: maker })
            return;
        }
        if (currentUser.admin === true) {
            res.render("post", { post: currentPost, user: maker, admin: true })
            return
        }
        res.render("post", { post: currentPost, user: maker })
    } catch (err) {
        res.redirect('/')
    }

})

router.post("/", async (req, res) => {
    try {
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        const newUser = Post.create({
            user: { id: currentUser.id, name: currentUser.username },
            title: req.body.title,
            text: req.body.post,
            created: new Date()
        });
        res.redirect('/')
    } catch (err) {
        res.redirect('/')
    }
})

module.exports = router