const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      //   require: true,
      trim: true,
    },
    phone: {
      type: String,
      // require:true,
      trim: true,
    },
    address: {
      type: String,
      require: true,
      trim: true,
    },

    city: {
      type: String,
      require: true,
      trim: true,
    },
    state: {
      type: String,
      require: true,
      trim: true,
    },
    pincode: {
      type: String,
      require: true,
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
module.exports = mongoose.model("Nufrom Shipping Address", addressSchema);
