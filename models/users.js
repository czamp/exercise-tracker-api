const mongoose = require('mongoose');
const shortid = require('shortid');

var Schema = mongoose.Schema;

// create Users Schema
var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  _id: {
    type: String,
    default: shortid.generate()
  }
});

// create Users model
var Users = mongoose.model('Users', userSchema);

module.exports = Users;
