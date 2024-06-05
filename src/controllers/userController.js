import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { v5 as uuidv5 } from "uuid";

dotenv.config();

const addUserData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;

    if (!data)
      return res
        .status(400)
        .send({ status: false, message: "User data is missing" });
    if (!data?.phone)
      return res
        .status(400)
        .send({ status: false, message: "contact is missing" });

    if (!data?.password) data.password = data.phone;

    const encryptPass = await bcrypt.hash(data.password, 10);
    data.password = encryptPass;

    const namespace = process.env.NAMESPACE; // random string
    const uniqueIdentifier = data?.phone;
    const uniqueSecretKey = uuidv5(uniqueIdentifier, namespace);
    data.loginKey = uniqueSecretKey;

    let saveData = await UserModel.create(data);
    res.status(201).send({ status: true, data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getUserData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let filter = { isDeleted: false };
    const userId = req.params.userId;
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "No user id is passed" });
    filter._id = userId;
    const userData = await UserModel.findOne(filter);
    // const userData = await UserModel.find(filter).sort({ createdAt: -1 });
    // if (userData.length === 0) return res.status(400).send({ status: false, message: "No user found" });
    if (!userData)
      return res.status(400).send({ status: false, message: "No user found" });
    return res.status(200).send({ status: true, data: userData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const listUserData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

    const userData = await UserModel.find({ isDeleted: false })
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!userData) {
      return res.status(404).send({ status: false, message: "No user found" });
    }

    return res.status(200).send({ status: true, data: userData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateUserData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    const userId = req.params.userId;

    let userData = await UserModel.findById(userId);
    if (!userData) {
      return res.status(404).send({
        status: false,
        message: "no userData found",
      });
    }

    let updatedData = await UserModel.findOneAndUpdate(
      { _id: userData },
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
      .send({ status: true, message: "success", data: userData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteUserData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const userId = req.params.userId;

    let userData = await UserModel.findById(userId);
    if (!userData) {
      return res.status(404).send({
        status: false,
        message: "user Id Not Found for the request id",
      });
    }
    if (userData.isDeleted == true) {
      return res.status(404).send({
        status: false,
        message: "userData already deleted not found",
      });
    }

    await UserModel.updateOne(
      { _id: userId },
      { isDeleted: true, deletedAt: Date.now() }
    );
    return res.status(200).send({
      status: true,
      message: "user is deleted succesfully",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export {
  addUserData,
  getUserData,
  listUserData,
  updateUserData,
  deleteUserData,
};
