const mongoose = require("mongoose");
const { Snowflake } = require("@theinternetfolks/snowflake");

const community = new mongoose.Schema({
  id: { type: String, primary: true, default: () => Snowflake.generate() },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  //make owner a reference to the user model
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Community", community);
