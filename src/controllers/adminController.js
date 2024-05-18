import AdminModel from "../models/adminModel.js";
import dotenv from "dotenv";
import { v5 as uuidv5 } from "uuid";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

dotenv.config();

const addAdminData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;

    if (!data) return resstatus(400).send({ status: false, message: "User data is missing" });
    if (!data?.phone) return res.status(400).send({ status: false, message: "contact is missing" });

    const encryptPass = await bcrypt.hash(data.password, 10)
    data.password = encryptPass

    const namespace = process.env.NAMESPACE; // random string
    const uniqueIdentifier = data?.phone;
    const uniqueSecretKey = uuidv5(uniqueIdentifier, namespace);
    data.loginKey = uniqueSecretKey;

    let saveData = await AdminModel.create(data);
    res.status(201).send({ status: true, data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getAdminData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let filter = { isDeleted: false };
    const adminId = req.params.adminId;
    if(!adminId)  return res.status(400).send({ status: false, message: "No admin id is passed" });
    filter._id = adminId
    const adminData = await AdminModel.find(filter).sort({ createdAt: -1 });
    if (adminData.length === 0)
      return res.status(400).send({ status: false, message: "No user found" });
    return res.status(200).send({
      status: true,
      data: adminData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const listAdminData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

    const adminData = await AdminModel.find({ isDeleted: false })
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!adminData) {
      return res
        .status(404)
        .send({ status: false, message: "No data found" });
    }
    return res.status(200).send({ status: true, data: adminData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateAdminData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    const adminId = req.params.adminId;

    let adminData = await AdminModel.findById(adminId);
    if (!adminData) {
      return res.status(404).send({
        status: false,
        message: "no adminData found",
      });
    }

    let updatedData = await AdminModel.findOneAndUpdate(
      { _id: adminData },
      data,
      {
        new: true,
      }
    );

    if (!updatedData) {
      return res.status(404).send({
        status: false,
        message: "no user found to update",
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: adminData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteAdminData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const adminId = req.params.adminId;

    let adminData = await AdminModel.findById(adminId);
    if (!adminData) {
      return res.status(404).send({
        status: false,
        message: "contactUs Id Not Found for the request id",
      });
    }
    if (adminData.isDeleted == true) {
      return res.status(404).send({
        status: false,
        message: "adminData already deleted not found",
      });
    }

    await AdminModel.updateOne(
      { _id: adminId },
      { isDeleted: true, deletedAt: Date.now() }
    );
    return res.status(200).send({
      status: true,
      message: "data is deleted succesfully",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export { addAdminData, getAdminData, listAdminData, updateAdminData, deleteAdminData };
