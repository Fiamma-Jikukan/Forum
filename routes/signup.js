const express = require("express")
const bcrypt = require('bcrypt');

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
        // If it got here, it means that the user is authenticated and ready to go to personal profile page.
        res.render('signup');
    } catch (err) {
        res.render('error', { "error message": err })
    }
})

router.post("/", async (req, res) => {
    try {
        // check to see if user already exists.
        const signupUser = await User.findOne({ username: req.body.username })
        if (signupUser) {
            res.render('signup', {failed: "Username already taken"});
            return;
        }
        // check to see if password is at least medium.
        const passRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        if (!passRegex.test(req.body.password)) {
            res.render('signup', {failed: "Password isn't strong enough."});
            return;
        }
        // hashing the password and creating a new user in the database.
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const newUser = User.create({
            username: req.body.username,
            password: hashedPass,
        });
        res.render('login', {massege:"User created! please log in."});
    } catch (err) {
        res.render('error', { "error message": err })
    }
})


module.exports = router