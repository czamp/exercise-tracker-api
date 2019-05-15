var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create exercise Schema
var exerciseSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  username: String
});

// Create exercise model
var Exercises = mongoose.model('Exercises', exerciseSchema);

module.exports = Exercises;
