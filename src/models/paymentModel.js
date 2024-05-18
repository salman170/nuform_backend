import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        default: "Razorpay",
    },
    paymentResult: {
        type: Object,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true,
    },
    razorpayReceipt: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    paymentDetails: {
        type: Object,
    },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);