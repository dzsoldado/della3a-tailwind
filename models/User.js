const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email:  {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});



let User = mongoose.model("User", UserSchema);

module.exports = User;