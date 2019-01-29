const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interviewerSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
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
      required: true
    }
  }],
  expires: {
    type: Date,
    required: true
  }
});

let Interviewer = mongoose.model('Interviewer', interviewerSchema);
module.exports = Interviewer;
