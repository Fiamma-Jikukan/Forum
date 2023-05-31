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
    Post,
    replySchema,
    Reply } = require("../database.js");

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
        const replysOfThisPostQ = await Reply.find({ post: req.params.id })
        const replysOfThisPost = replysOfThisPostQ.map(item => {
            return {
                reply: item.reply,
                user: {name: item.user.name, id: item.user.id},
                time: item.created
            }
        })
        if (!replysOfThisPost) {
            res.render("post", { post: currentPost, user: maker })
            return;
        }
        if (!req.cookies.session) {
            res.render("post", {
                post: currentPost,
                user: maker,
                replys: replysOfThisPost
            })
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.render("post", {
                post: currentPost,
                user: maker,
                replys: replysOfThisPost
            })
            return;
        }
        if (currentUser.admin === true) {
            res.render("post", {
                post: currentPost,
                user: maker,
                replys: replysOfThisPost,
                authenticated: true,
                admin: true
            })
            return
        }
        res.render("post", {
            post: currentPost,
            user: maker,
            replys: replysOfThisPost,
            authenticated: true
        })
    } catch (err) {
        res.redirect('/')
    }

})

router.post("/", async (req, res) => {
    try {
        const currentSession = await Session.findById(req.cookies.session);
        const currentUser = await User.findById(currentSession.user);
        const newPost = await Post.create({
            user: { id: currentUser.id, name: currentUser.username },
            title: req.body.title,
            text: req.body.post,
            created: new Date()
        });
        res.redirect(`/post/${newPost.id}`)
    } catch (err) {
        res.redirect('/error')
    }
})

router.post("/:id/reply", async (req, res) => {
    try {
        const currentPost = await Post.findById(req.params.id)
        if (!req.cookies.session) {
            res.redirect(`/post/${currentPost.id}`);
            return;
        }
        const currentSession = await Session.findById(req.cookies.session);
        if (!currentSession) {
            res.clearCookie('session');
            res.redirect(`/post/${currentPost.id}`);
            return;
        }
        const currentUser = await User.findById(currentSession.user);
        if (!currentUser) {
            res.redirect(`/post/${currentPost.id}`);
            return;
        }
        const newReply = await Reply.create({
            user: {
                id: currentUser.id, name: currentUser.username
            },
            post: currentPost.id,
            reply: req.body.reply,
            created: new Date()
        });
        res.redirect(`/post/${currentPost.id}`);

    } catch (err) {
        res.render('error', { "error-message": err })
    }
})


module.exports = router