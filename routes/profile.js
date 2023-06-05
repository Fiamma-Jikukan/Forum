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

router.get("/:name", async (req, res) => {
    try {
        const pageUser = await User.find({ username: req.params.name });
        if (!pageUser[0]) {
            res.render('profile', { user: { username: "this user does not exist" } });
            return;
        }
        const allPostOfUserQ = await Post.find({
            user:
            {
                id: pageUser[0].id,
                name: pageUser[0].username
            }
        })
        const allPostOfUser = allPostOfUserQ.map((item) => { 
            return {
                id: item.id,
                user: item.user,
                title: item.title,
                time: item.created
            }
        })
        if (!req.session) {
            res.render('profile', { user: pageUser[0] , posts: allPostOfUser})
            return
        }
        const currentUser = await User.findById(req.session.user);
        if (req.params.name !== currentUser.username) {
            res.render(`profile`, { user: pageUser[0],posts: allPostOfUser, admin: currentUser.admin })
            return;
        }
        res.render(`profile`, { user: currentUser, posts: allPostOfUser, session: req.session, admin: currentUser.admin })
    } catch (err) {
        res.redirect('/error')
    }

})

module.exports = router