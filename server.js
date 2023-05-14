const http = require("http");
const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()

const username = "Fiamma";
const password = "IKilledThePope123";

const app = express();
// middleware
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(__dirname + "/public"));
// get requests
app.get("/", (req, res) => {
    res.render('index', { title: 'Welcome To My Site', message: 'Please log in' });
})
// post requests
app.post("/login", async (req, res) => {
    try {
        if (req.body.username === username && req.body.password === password) {
            res.render('index', { title: 'You are logged in!', message: ':)' });
        } else {
            res.render('index', { title: 'wrong username or password!', message: ':(' });
        }
    }
    catch (err) {
        res.render('index', { title: 'Error', message: 'Please log in' });
    }
})
// port
app.listen(3000, () => {
    console.log("running on port 3000");
});
