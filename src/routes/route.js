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
} from "../controllers/orderController.js";

router.get("/test-me", function (req, res) {
  res.send("Hello World");
});

router.post('/login', login)
router.post('/resetPassword', forgotPassword, resetPassword)

router.post("/addUserData", addUserData)
router.get("/getUserData/:userId", authentication, getUserData)
router.get("/listUserData", authentication, listUserData)
router.put("/updateUserData/:userId", authentication, authorization, updateUserData)
router.put("/deleteUserData/:userId", authentication, authorization, deleteUserData)

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
router.post("/placeOrder", placeOrder);
router.get("/getOrderData/:orderId/", authentication, getOrderData);
router.get("/listOrderData", authentication, listOrderData);
router.put("/updateOrderData/:orderId", authentication, authorization, updateOrderData);
router.delete("/deleteOrderData/:orderId", authentication, authorization, deleteOrderData);


router.all('/*', async function (req, res) {
  return res.status(400).send({ status: false, message: "Page not found" })
})


export default router