const mongoose = require("mongoose")

require('dotenv').config()

const connect = mongoose.connect(process.env.DATABASE)

const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
})
let User = mongoose.model("User", userSchema);

const sessionSchema = new Schema({
    user: {
        type: Object,
        required: true
    },
    timeCreated: {
        type: Date,
        expires: 1 * 60 * 60 * 24
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