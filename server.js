const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()

const app = express();
//middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(req.method + " " + req.path + "-" + req.ip);
    next()
})
app.use("/public", express.static(__dirname + "/public"));
//get requests
app.get("/", (req, res) => {
    res.render('index', { title: 'hi', message: 'Please log in' });
    //    res.sendFile(absolute);
})
//post requests

//port
app.listen(3000, () => {
    console.log("running on port 3000");
});
