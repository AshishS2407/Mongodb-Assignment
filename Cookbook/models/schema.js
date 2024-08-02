const { Schema } = require('mongoose');
const { model } = require('mongoose');

const favouriteSchema = new Schema({
  title: { type: String },
  image: { type: String },
  recipeId: { type: String },
}, { _id: false });


const userSchema = new Schema({
  username: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  favourites: { type: [favouriteSchema], default: [] }
})

const userDetails = model("UserDetails", userSchema);
module.exports = userDetails;