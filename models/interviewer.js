const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interviewerSchema = new Schema({
    // what are we going to store?
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

let Interviewer = mongoose.model('Interviewer', interviewerSchema);
module.exports = Interviewer;
