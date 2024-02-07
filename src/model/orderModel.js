const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const orderShema = new mongoose.Schema(
  {
    addressId: { type: ObjectId, ref: "Nufrom Shipping Address", required: true, trim: true, },
    transationId: {
      type: String,
      require: true,
      trim: true,
    },
    totalPrice: { type: Number, required: true, trim: true },
    deliveryStatus: {
      type: String,
      enum: ["Processing", "Shiped", "On the Way", "Delivered"],
      default: "Processing",
    },
    items: [
      {
        productName: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, trim: true },
        _id: false,
      },
    ],
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
module.exports = mongoose.model("Nuform orders", orderShema);
