import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userPhone: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

export default mongoose.model("ProductReview", productReviewSchema);


