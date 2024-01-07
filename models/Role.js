const mongoose = require("mongoose");
const { Snowflake } = require("@theinternetfolks/snowflake");

const role = new mongoose.Schema({
  id: { type: String, primary: true, default: () => Snowflake.generate() },
  name: { type: String, required: true, unique: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", role);
