const http = require("http");
const express = require("express")
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
            res.render("post")
        } catch (err) {
            res.redirect('/')
        }
    })

    router.post("/", async (req, res) => {
        try {
            const currentSession = await Session.findById(req.cookies.session);
            const currentUser = await User.findById(currentSession.user);
            const newUser = Post.create({
                title: req.body.title,
                password: hashedPass,
            });

            
        } catch (err) {
            res.redirect('/')
        }
    })

module.exports = router