const http = require("http");
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const ObjectId = require('mongoose').Types.ObjectId;
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
        if (!req.session) {
            res.clearCookie('session');
            res.redirect('/');
            return;
        }
        const currentUser = await User.findById(req.session.user);
        res.render("newPost", currentUser)
    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

router.get("/:id", async (req, res) => {
    try {
        if(!ObjectId.isValid(req.params.id)){
            res.redirect('/');
            return;
        }
        const currentPost = await Post.findById(req.params.id);
        if (!currentPost) {
            res.redirect('/');
            return;
        }
        const maker = await User.findById(currentPost.user.id);
        const repliesOfThisPostQ = await Reply.find({ post: req.params.id })
        const repliesOfThisPost = repliesOfThisPostQ.map(item => {
            return {
                reply: item.reply,
                user: { name: item.user.name, id: item.user.id },
                time: item.created
            }
        })
        if (!req.session) {
            res.render("post", {
                post: currentPost,
                user: maker,
                replies: repliesOfThisPost
            })
            return;
        }
        const currentUser = await User.findById(req.session.user);
        res.render("post", {
            post: currentPost,
            user: maker,
            replies: repliesOfThisPost,
            authenticated: true,
            admin: currentUser.admin
        })
    } catch (err) {
        res.redirect('/error')
    }

})

router.post("/", async (req, res) => {
    try {
        if (!req.session) {
            res.redirect('/')
            return;
        }
        const currentUser = await User.findById(req.session.user);
        const newPost = await Post.create({
            user: { id: currentUser.id, name: currentUser.username },
            title: req.body.title,
            text: req.body.post,
            created: new Date()
        });
        res.redirect(`/post/${newPost.id}`)
    } catch (err) {
        res.render('error', { "error-message": err })
    }
})

router.post("/:id/reply", async (req, res) => {
    try {
        const currentPost = await Post.findById(req.params.id)
        if (!req.session) {
            res.clearCookie('session');
            res.redirect(`/post/${currentPost.id}`);
            return;
        }
        const currentUser = await User.findById(req.session.user);
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