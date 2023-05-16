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
})
let Session = mongoose.model("Session", sessionSchema);


const users = {
    "Fiamma": "IKilledThePope123",
    "Madara": "KageJoke",
    "admin": "admin"
}

const sessions = {

}

module.exports = {
    Schema,
    userSchema,
    User,
    users,
    sessions,
    connect,
    sessionSchema,
    Session
}