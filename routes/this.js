const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")

const router = express.Router();

router.get("/", async (req, res) => {
        try {
            res.render("post")
        } catch (err) {
            res.redirect('/')
        }
    })

    router.post("/", async (req, res) => {
        try {
            res.send("post created")
        } catch (err) {
            res.redirect('/')
        }
    })

module.exports = router