const express = require("express")
const ObjectId = require('mongoose').Types.ObjectId;
const { User,
    Session,
    Post,
    Reply } = require("../database.js");

const router = express.Router();

router.get("/:name", async (req, res) => {
    try {
        const pageUser = await User.findOne({ username: req.params.name });
        if (!pageUser) {
            res.render('profile', { user: { username: "this user does not exist" } });
            return;
        }
        const allPostOfUserQ = await Post.find({
            'user.id': pageUser.id,
        })
        const allPostOfUser = allPostOfUserQ.map((item) => {
            return {
                id: item.id,
                user: item.user,
                title: item.title,
                time: item.created
            }
        })
        if (!req.user) {
            res.render('profile', { user: pageUser, posts: allPostOfUser })
            return
        }
        if (req.params.name !== req.user.username) {
            res.render(`profile`, { user: pageUser, posts: allPostOfUser, admin: req.user.admin })
            return;
        }
        res.render(`profile`, { user: req.user, posts: allPostOfUser, session: req.session, admin: req.user.admin })
    } catch (err) {
        res.render('error', { "error-message": err })
    }

})

module.exports = router