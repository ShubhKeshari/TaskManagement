const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member",
    },
    isActive:{
        type: Boolean,
        enum: [true,false],
        default: true,
    }
  },
  {
    versionKey: false,
  }
);

const Users = mongoose.model("user", userSchema);

module.exports = {
  Users,
};
