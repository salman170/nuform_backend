import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASS;
    const response = await axios.post(
      process.env.SHIPROCKET_URL + "auth/login",
      {
        email,
        password,
      }
    );


    req.shiprocket_token = response.data.token;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .send({ status: false, message: "Authentication failed" });
  }
};

export const fetchRates = async (req, res) => {
  try {
    const shiprocket_token = req.shiprocket_token;
    const { pickup_postcode, delivery_postcode, weight, cod } = req.body;

    if(!pickup_postcode || !delivery_postcode || !weight) return res.status(400).send({ status: false, message: "Invalid request" });

    const response = await axios.get(
      process.env.SHIPROCKET_URL + "courier/serviceability/",
      {
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
      }
    );


    return res.status(200).send({ status: true, data: response.data });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send({ status: false, message: "Failed to fetch rates" });
  }
};
