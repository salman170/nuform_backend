import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        min: 0,
    },
    maxPrice: {
        type: Number,
        min: 0,
    },
    unit: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
    },
    stock: {
        type: Number,
        min: 0,
    },
    flavour: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
