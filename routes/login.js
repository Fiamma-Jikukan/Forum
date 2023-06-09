const express = require("express")
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser")

const { User,
    Session,
    Post,
    Reply } = require("../database.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        //check if there's a session. If not, render the loging main page.
        if (req.user) {
            res.redirect(`/profile/${req.user.username}`);
            return;
        }
        res.render('login');
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

router.post("/", async (req, res) => {
    try {
        const loginuser = await User.findOne({ username: req.body.username })
        if (!loginuser) {
            res.render('login', { massege: "wrong username or password" });
            return;
        }
        const validate = await bcrypt.compare(req.body.password, loginuser.password)
        if (!validate) {
            res.render('login', { massege: "wrong username or password" });
            return;
        }
        const newSession = await Session.create({
            user: loginuser.id,
            timeCreated: new Date()
        });
        res.cookie('session', newSession.id, { maxAge: 1000 * 60 * 60 });
        res.redirect('/');
    }
    catch (err) {
        res.render('error', { "error message": err })
    }
})


module.exports = router