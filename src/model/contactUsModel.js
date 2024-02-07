const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
    },
    phone: {
      type: String,
      // require:true,
      trim: true,
    },
    // company: {
    //   type: String,
    //   trim: true,
    // },

    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Nuform contactUs", contactSchema);