const express = require("express")
const ObjectId = require('mongoose').Types.ObjectId;
const { User,
    Session,
    Post,
    Reply } = require("../database.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/');
            return;
        }
        res.render("newPost", req.user)
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
        res.render("post", {
            post: currentPost,
            user: maker,
            replies: repliesOfThisPost,
            authenticated: req.user,
            admin: req.user?.admin
        })
    } catch (err) {
        res.render('error', { "error-message": err })
    }

})

router.post("/", async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/')
            return;
        }
        const newPost = await Post.create({
            user: { id: req.user.id, name: req.user.username },
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
        if(!ObjectId.isValid(req.params.id)){
            res.redirect('/');
            return;
        }
        const currentPost = await Post.findById(req.params.id)
        if (!req.user) {
            res.redirect(`/post/${currentPost.id}`);
            return;
        }
        const newReply = await Reply.create({
            user: {
                id: req.user.id, name: req.user.username
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