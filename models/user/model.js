const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "This field is required"],
      trim: true,
    },
    email: {
      type: String,
      require: [true, "This field is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      require: [true, "This field is required"],
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
