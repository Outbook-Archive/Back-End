const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  unixTimestamp: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true
  }
});

let Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
