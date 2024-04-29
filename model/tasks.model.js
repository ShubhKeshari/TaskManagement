const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
    completed: {
      type: Boolean,
      deafault: false,
      enum: [false, true],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    deleteStatus:{
        type:Boolean,
        enum:[true, false],
        default:false,
    }
  },
  {
    versionKey: false,
  }
);

const Tasks = mongoose.model("task", tasksSchema);

module.exports = {
  Tasks,
};
