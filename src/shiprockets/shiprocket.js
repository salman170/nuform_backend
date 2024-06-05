import axios from "axios";
import dotenv from "dotenv";
import OrderModel from "../models/orderModel.js";
dotenv.config();
import moment from "moment";

export const shiprocketAuthenticate = async (req, res, next) => {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASS;
    const response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
      email,
      password,
    });

    req.shiprocket_token = response.data.token;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({ status: false, message: "Authentication failed" });
  }
};

export const fetchRates = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token && req.assignRates) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const { pickup_postcode, delivery_postcode, weight, cod } = req.body;

    if (!pickup_postcode || !delivery_postcode || !weight) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.get(process.env.SHIPROCKET_URL + "courier/serviceability/", {
      params: {
        pickup_postcode: pickup_postcode,
        delivery_postcode: delivery_postcode,
        weight: weight,
        cod: cod ? cod : 0,
      },
      headers: {
        Authorization: `Bearer ${shiprocket_token}`,
        "Content-Type": "application/json",
      },
    });
 
    if (req.assignRates) {
      return response.data.data;
    }

    return res.status(200).send({ status: true, data: response.data.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to fetch rates" });
  }
};

export const optimizedRates = async (req, res) => {
  try {
    req.assignRates = 1;

    // assign rates in terms of fast etd and cheap rates
    const rates = await fetchRates(req, res);

    let available_courier_companies = rates.available_courier_companies || [];


    let cheapRatesInAscendingOrder = available_courier_companies.sort((a, b) => a.rate - b.rate);

    let cheapRates = []
    cheapRates.push(cheapRatesInAscendingOrder[0])
    for(let i=1; i<cheapRatesInAscendingOrder.length; i++){
      //check if rate is upto 20% more than push it to cheapRates
      if(cheapRatesInAscendingOrder[i].rate <= cheapRatesInAscendingOrder[0].rate * 1.2){
        cheapRates.push(cheapRatesInAscendingOrder[i])
      }
    }

    let fastETDInAscendingOrder = cheapRates.sort((a, b) => a.etd_hours - b.etd_hours);


    let returnData = {
      courier_name: fastETDInAscendingOrder[0].courier_name,
      estimated_delivery_days: fastETDInAscendingOrder[0].etd,
      etd: fastETDInAscendingOrder[0].etd,
      etd_hours: fastETDInAscendingOrder[0].etd_hours,
      rate: fastETDInAscendingOrder[0].rate,
      courier_company_id: fastETDInAscendingOrder[0].courier_company_id,
    };
 
    if(req.isCreateShipment){
      return returnData;
    }
 
    return res.status(200).send({ status: true, data: returnData });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to assign rates" });
  }
};

export const createShiprocketOrder = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const order_id = req.body.order_id;

    if (!order_id) return res.status(400).send({ status: false, message: "Invalid request" });

    const order = await OrderModel.findById(order_id);

    if (!order) return res.status(400).send({ status: false, message: "Order not found" });

    const order_date = moment(order.createdAt).format("YYYY-MM-DD HH:mm");

    const requestBody = {
      order_id: order._id,
      order_date: order_date,
      pickup_location: order.pickupAddress.address, // name of location in shiprocket account
      billing_customer_name: order.shippingAddress.firstName,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.phone,
      shipping_is_billing: true,
      order_items: order.products.map((product) => {
        return {
          name: product.name,
          sku: product._id,
          units: product.units, // this need to be fixed
          selling_price: product.price,
        };
      }),
       payment_method: "Prepaid",
      // payment_method: "Prepaid",
      sub_total: order.totalPrice,
      length: 1,
      breadth: 1,
      height: 1,
      weight: order.weight,
    };

    const response = await axios.post(process.env.SHIPROCKET_URL + "/orders/create/adhoc", requestBody, {
      headers: {
        Authorization: `Bearer ${shiprocket_token}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to create order" });
  }
};

export const cancelShiprocketOrder = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const awbs = req.body.awbs;

    if (!awbs?.length) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.post(
      process.env.SHIPROCKET_URL + "orders/cancel/shipment/awbs",
      {
        awbs: awbs,
      },
      {
        headers: {
          Authorization: `Bearer ${shiprocket_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to cancel order" });
  }
};

export const trackShiprocketOrder = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const awb = req.params.awb;

    if (!awb) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.get(process.env.SHIPROCKET_URL + `courier/track/awb/${awb}`, {
      headers: {
        Authorization: `Bearer ${shiprocket_token}`,
        "Content-Type": "application/json",
      },
    });

    //update current status in order
    let currentStatus = response?.data?.tracking_data?.shipment_track?.[0]?.current_status;

    if(currentStatus){
      await OrderModel.findOneAndUpdate({ awb: awb }, { status: currentStatus });
    }

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to track order" });
  }
};

export const trackMultipleShiprocketOrders = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const awbs = req.body.awbs;

    if (!awbs?.length) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.post(
      process.env.SHIPROCKET_URL + "courier/track/awbs",
      {
        awbs: awbs,
      },
      {
        headers: {
          Authorization: `Bearer ${shiprocket_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to track orders" });
  }
};

export const createShiprocketManifest = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    let manifest = req.body.shipmentIds;

    if (!manifest?.length) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.post(
      process.env.SHIPROCKET_URL + "manifest/generate",
      {
        manifest: manifest,
      },
      {
        headers: {
          Authorization: `Bearer ${shiprocket_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to create manifest" });
  }
};

export const generateLabelShiprocketOrder = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    const shipmentIds = req.body.shipmentIds;

    if (!shipmentIds?.length) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.post(
      process.env.SHIPROCKET_URL + `courier/generate/label`,
      {
        shipment_id: shipmentIds,
      },
      {
        headers: {
          Authorization: `Bearer ${shiprocket_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to generate label" });
  }
};

export const createForwardShipmentShiprocketOrder = async (req, res) => {
  try {
    let shiprocket_token = req.shiprocket_token;

    if (!shiprocket_token) {
      let response = await axios.post(process.env.SHIPROCKET_URL + "auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS,
      });
      shiprocket_token = response.data.token;
      req.shiprocket_token = shiprocket_token;
    }

    if (!shiprocket_token) return res.status(401).send({ status: false, message: "Token is missing" });

    if(Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Invalid request" });

    const order_id = req.body.order_id;

    if (!order_id) return res.status(400).send({ status: false, message: "Invalid request" });

    let order = await OrderModel.findById(order_id);
    order = order._doc;
    

    if (!order) return res.status(400).send({ status: false, message: "Order not found" });

    if(!req.body.weight) req.body.weight = order.weight;
    if(!req.body.pickup_postcode) req.body.pickup_postcode = order?.pickupAddress?.pincode || "500080";
    if(!req.body.delivery_postcode) req.body.delivery_postcode = order?.shippingAddress?.pincode;

    const order_date = moment(order.createdAt).format("YYYY-MM-DD");

    req.isCreateShipment = 1;
    let courierRates = await optimizedRates(req, res);

    const requestBody = {
      order_id: order_id,
      order_date: order_date,
      billing_customer_name: order.shippingAddress.firstName,
      billing_last_name: order.shippingAddress.lastName,
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.phone,
      courier_id: courierRates.courier_company_id,
      shipping_is_billing: true,
      order_items: order.products.map((product) => {
        return {
          name: product.name,
          sku: product.sku,
          units: product.units,
          selling_price: product.selling_price,
        };
      }),
      payment_method: "Prepaid",
      sub_total: order.totalPrice,
      length: 1,
      breadth: 1,
      height: 1,
      weight: order.weight,
      pickup_location: "HomeNew", // name of location in shiprocket account
      // this is the address where the shipment will be picked up
      vendor_details: {
        email: "feedback@nuform.in",
        phone: 7671051443,
        name: "Nuform",
        address:
          "Flat no 507, Aditya Heights, Venkat Enclave, White fields, Kondapur,",
        address_2: "",
        city: "Hyderabad",
        state: "Telangana",
        country: "india",
        pin_code: "500081",
        pickup_location: "HomeNew",
      },
    };

    //validatig all required fields in requestBody there or not
    for (const key in requestBody) {
      if (requestBody[key] == null || requestBody[key] == "") {
        return res.status(400).send({ status: false, message: `${key} is required` });
      }

      //check for array and object as well
      if (typeof requestBody[key] == "object" && (requestBody[key].length == 0 || Object.keys(requestBody[key]).length == 0)) {
        return res.status(400).send({ status: false, message: `${key} is required` });
      }

      //check for order items
      if (key == "order_items") {
        for (let i = 0; i < requestBody[key].length; i++) {
          for (const k in requestBody[key][i]) {
            if (requestBody[key][i][k] == null || requestBody[key][i][k] == "") {
              return res.status(400).send({ status: false, message: `${k} is required in order_items` });
            }
          }
        }
      }
    }


    const response = await axios.post(process.env.SHIPROCKET_URL + "shipments/create/forward-shipment", requestBody, {
      headers: {
        Authorization: `Bearer ${shiprocket_token}`, 
        "Content-Type": "application/json",
      },
    });


    //let's update order with shipment id and other details

    let responsePayload = response.data.payload

    let shipmentData = responsePayload

    await OrderModel.findByIdAndUpdate(order_id, {
      shipment_id: responsePayload.shipment_id,
      awb: responsePayload.awb_code,
      shipmentData: shipmentData,
    });


    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: false, message: "Failed to forward shipment" });
  }
};
