const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interviewerSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    // what are we going to store?
    tokens: [{
        access_token: {
            type: String,
            required: true
        },
        refresh_token: {
            type: String,
            required: true
        },
        id_token: {
            type: String,
            require: true
        }
    }]
});

let Interviewer = mongoose.model('Interviewer', interviewerSchema);
module.exports = Interviewer;
