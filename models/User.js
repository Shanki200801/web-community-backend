const mongoose = require("mongoose");
const { Snowflake } = require("@theinternetfolks/snowflake");

const user = new mongoose.Schema({
  id: { type: String, primary: true, default: Snowflake.generate() },
  name: { type: String, required: true, default: null },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", user);
