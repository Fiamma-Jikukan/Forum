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

// create session schema and model
const logSchema = new Schema({
    user: {
        type: Object,
        required: true,
    },
    dateCreated: {
        type: Date,
        required: true,
        default: new Date()
    },
    title: {
        type: String,
        maxLength: 100,
        required: true
    },
    log: {
        type: String,
        maxLength: 500,
        required: true
    }
})
let Log = mongoose.model("Log", logSchema);

module.exports = {
    Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session, 
    logSchema,
    Log
}