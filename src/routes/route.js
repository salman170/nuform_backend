import express from "express";
const router = express.Router()

import {authentication, authorization} from "../middlewares/auth.js"
import { login, forgotPassword, resetPassword } from "../middlewares/loginAuth.js";
import {
  addUserData, 
  getUserData, 
  listUserData,
  updateUserData, 
  deleteUserData
} from "../controllers/userController.js"
import {
  addAdminData, 
  getAdminData, 
  listAdminData, 
  updateAdminData, 
  deleteAdminData
} from "../controllers/adminController.js";
import {
  addProductData,
  getProductData,
  listProductData,
  updateProductData,
  deleteProductData,
} from "../controllers/productController.js";
import {
  createOrder,
  placeOrder,
  getOrderData,
  listOrderData,
  updateOrderData,
  deleteOrderData,
  updateSuccessOrderData,
} from "../controllers/orderController.js";

import {
  addEditProductReview,
  getProductReview,
  listProductReview
}from "../controllers/productReviewController.js";

import { 
  shiprocketAuthenticate, 
  fetchRates, 
  optimizedRates,
  createForwardShipmentShiprocketOrder ,
  trackShiprocketOrder
} from "../shiprockets/shiprocket.js";

router.get("/test-me", function (req, res) {
  res.send("Hello World");
});

router.post('/login', login) // tested
router.post('/forgotPassword', forgotPassword) // tested
router.post('/resetPassword', resetPassword) // tested

router.post("/addUserData", addUserData) // tested
router.get("/getUserData/:userId", authentication, getUserData) // tested
router.get("/listUserData", authentication, listUserData) // tested
router.put("/updateUserData/:userId", authentication, authorization, updateUserData) // tested
router.put("/deleteUserData/:userId", authentication, authorization, deleteUserData) // tested

router.post("/addAdminData", addAdminData)
router.get("/getAdminData/:adminId", authentication, getAdminData)
router.get("/listAdminData", authentication, listAdminData)
router.put("/updateAdminData/:adminId", authentication, authorization, updateAdminData)
router.put("/deleteAdminData/:adminId", authentication, authorization, deleteAdminData)


router.post("/addProductData", addProductData);
router.get("/getProductData/:productId", authentication, getProductData);
router.get("/listProductData", authentication, listProductData);
router.put("/updateProductData/:productId", authentication, authorization, updateProductData);
router.put("/deleteProductData/:productId", authentication, authorization, deleteProductData);

router.post("/createOrder", authentication, createOrder);
router.post("/placeOrder", placeOrder); // alreday tested before
router.get("/getOrderData/", authentication, getOrderData);
router.get("/listOrderData",authentication, listOrderData);
router.put("/updateOrderData/:orderId", authentication, authorization, updateOrderData);
router.delete("/deleteOrderData/:orderId", authentication, authorization, deleteOrderData);
router.put("/updateSuccessOrderData/:orderId/:paymentId", updateSuccessOrderData);


router.post("/addEditProductReview", addEditProductReview)
router.get("/listProductReview", listProductReview)
router.get("/getProductReview", getProductReview);


//shiprocket routes
router.post("/fetchRates", shiprocketAuthenticate, fetchRates); // tested
router.post("/optimizedRates", optimizedRates); // tested 
router.post("/createShipment", createForwardShipmentShiprocketOrder); // tested
router.get("/trackShipment/:awb", trackShiprocketOrder);


router.all('/*', async function (req, res) {
  return res.status(400).send({ status: false, message: "Page not found" })
})


export default router