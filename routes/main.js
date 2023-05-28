const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")

const router = express.Router();

router.get("/", async (req, res) => {
        try {
            res.render("forum")
        } catch (err) {
            res.redirect('/')
        }
    })

module.exports = router