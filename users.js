// set up mongoose
const mongoose = require("mongoose")
require('dotenv').config()
const connect = mongoose.connect(process.env.DATABASE)
const Schema = mongoose.Schema;
// create user schema and model
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
})
let User = mongoose.model("User", userSchema);
// create session schema and model
const sessionSchema = new Schema({
    user: {
        type: Object,
        required: true,
    },
    timeCreated: {
        type: Date,
        expires: 3600
    }
})
let Session = mongoose.model("Session", sessionSchema);

module.exports = {
    Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session
}