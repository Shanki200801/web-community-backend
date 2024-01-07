const mongoose = require("mongoose");
const { Snowflake } = require("@theinternetfolks/snowflake");

const member = new mongoose.Schema({
  id: { type: String, primary: true, default: Snowflake.generate },
  community: {
    type: String,
    required: true,
  },
  user: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Member", member);
