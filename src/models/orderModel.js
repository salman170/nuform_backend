import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        sku: {
          type: String,
          required: true,
        },
        units: {
          type: Number,
          min: 1,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        selling_price: {
          type: Number,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    quantity: {
      type: Number,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
    },
    shippingRate: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    pickupAddress: {
      type: Object,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    shipment_id: {
      type: String,
      trim: true,
    },
    awb: {
      type: String,
      trim: true,
    },
    shipmentData : {
      type: Object,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    paymentDetails: {
      type: Object,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentReceipt: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
