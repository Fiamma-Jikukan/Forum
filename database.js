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
    },
    admin: {
        type: Boolean,
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

const postSchema = new Schema({
    user: {
        type: Object,
        required: true,
    },
    title: {
        type: String,
        maxLength: 50
    },
    text: {
        type: String,
        maxLength: 100000
    },
    replys: {
        type: Object,
        required: true,
    },
    created: {
        type: Date,
        default: new Date()
    }    
})
let Post = mongoose.model("Post", postSchema);

const replySchema = new Schema({
    user: {
        type: Object,
        required: true,
    },
    post: {
        type: String,
        required: true,
    },
    reply: {
        type: String,
        maxLength: 100000
    },
    created: {
        type: Date,
        default: new Date()
    }    
})
let Reply = mongoose.model("Reply", replySchema);

module.exports = {
    Schema,
    userSchema,
    User,
    connect,
    sessionSchema,
    Session,
    postSchema,
    Post,
    replySchema,
    Reply
}