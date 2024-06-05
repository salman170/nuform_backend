import OrderModel from "../models/orderModel.js";
import paymentModel from "../models/paymentModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const createOrder = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;

    if (!data) return res.status(400).send({ status: false, message: "order data is missing" });

    let saveData = await OrderModel.create(data);
    res.status(201).send({ status: true, data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const placeOrder = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    console.log("data", data);

    if (!data) return res.status(400).send({ status: false, message: "order data is missing" });

    let saveData = await OrderModel.create(data);
    let orderId = saveData._id;

    //integate razorpay payment instances here
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const paymentData = {
      amount: saveData.totalPrice * 100,
      currency: "INR",
      receipt: orderId,
    };

    razorpayInstance.orders.create(paymentData, async (err, order) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err });
      }
      let paymentData = {
        user: saveData.user,
        order: orderId,
        paymentMethod: "Razorpay",
        paymentResult: "PENDING",
        razorpayPaymentId: order.id,
        razorpayReceipt: order.receipt,
        amount: order.amount / 100,
        status: order.status,
        paymentDetails: order,
      };

      let savePaymentData = await paymentModel.create(paymentData);

      // now update required details in order model
      saveData.paymentId = savePaymentData._id;
      saveData.isPaid = true;
      saveData.paidAt = new Date();
      saveData.paymentResult = "PENDING";
      saveData.paymentMethod = "Razorpay";
      saveData.transactionId = order.id;
      saveData.paymentReceipt = order.receipt;
      saveData.status = order.status;
      saveData.updatedAt = new Date();
      saveData.paymentDetails = order;
      await saveData.save();

      return res.status(200).send({
        transactionId: saveData.transactionId,
        total: saveData.paymentDetails.amount,
        orderId: orderId,
        paymentId: savePaymentData._id,
        status: true,
      });
    });

    // res.status(201).send({ status: true, data: saveData });
    console.log("saveData", saveData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getOrderData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let filter = { isDeleted: false };
    const orderId = req.query.orderId;
    if (orderId) filter._id = orderId;

    if (!req?.query?.email) return res.status(400).send({ status: false, message: "email is missing" });

    filter.email = req?.query?.email;
    // if (!req?.query?.userId)
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "user id is missing" });

    // filter.user = req?.query?.userId;

    if (req?.query?.paymentResult)
      filter.paymentResult = req?.query?.paymentResult;

    const orderData = await OrderModel.find(filter).sort({ createdAt: -1 });
    if (orderData.length === 0) return res.status(400).send({ status: false, message: "No order found" });
    return res.status(200).send({
      status: true,
      data: orderData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const listOrderData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

    const orderData = await OrderModel.find({ isDeleted: false })
      // .populate("product user")
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!orderData) {
      return res.status(404).send({ status: false, message: "No orders found" });
    }
    return res.status(200).send({ status: true, data: orderData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateOrderData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const orderId = req.params.orderId;
    const updateFields = req.body;

    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, updateFields, { new: true });
    if (!updatedOrder) {
      return res.status(404).send({ status: false, message: "Order not found" });
    }
    return res.status(200).send({ status: true, data: updatedOrder });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateSuccessOrderData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const orderId = req.params.orderId;
    const paymentId = req.params.orderId;

    // const updatePayment = await paymentModel.findByIdAndUpdate(
    //   paymentId,
    //   { paymentResult: "SUCCESS" },
    //   { new: true }
    // );
    // if (!updatePayment) {
    //   return res
    //     .status(404)
    //     .send({ status: false, message: "Payment details not found" });
    // }
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, { paymentResult: "SUCCESS" }, { new: true });
    if (!updatedOrder) {
      return res.status(404).send({ status: false, message: "Order not found" });
    }

    return res.status(200).send({ status: true, data: updatedOrder });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteOrderData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const orderId = req.params.orderId;

    const orderToUpdate = await OrderModel.findById(orderId);
    if (!orderToUpdate) {
      return res.status(404).send({ status: false, message: "Order not found" });
    }

    orderToUpdate.isDeleted = true;
    orderToUpdate.deletedAt = new Date();
    await orderToUpdate.save();

    return res.status(200).send({ status: true, message: "Order deleted" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export { createOrder, placeOrder, getOrderData, listOrderData, updateOrderData, deleteOrderData, updateSuccessOrderData };
