import mongoose from "mongoose";

const addressSchema = {
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
};

const adminSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  age: {
    type: Number,
  },
  role: {
    type: String,
    default: "admin",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  shippingAddresses: [
    {
      type: addressSchema,
    },
  ],
  loginKey: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
};

const adminModel = new mongoose.Schema(adminSchema, { timestamps: true });

export default mongoose.model("adminDetails", adminModel);
