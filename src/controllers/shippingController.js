const addressModel = require("../model/addressModel");
const mongoose = require('mongoose');
const moment = require("moment");
require("moment-timezone");
require("dotenv").config();



const createShippingAdd = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    // let {name,email,subject,message,phone}= data

    moment.tz.setDefault("Asia/Kolkata"); //default india time zone

    // Get the current date and time
    let dates = moment().format("YYYY-MM-DD");
    let times = moment().format("HH:mm:ss");
    data.date = dates;
    data.time = times;

    let saveData = await addressModel.create(data);
    res.status(201).send({ status: true, data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//=================================================================

const getShippingAdd = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let filter = { isDeleted: false }; //required the docs which r not deleted
    //finding the docs with filter and sorting in deceasing order for createdAt key
    let data = await addressModel.find(filter).sort({ createdAt: -1 });
    if(data.length===0) return res.status(400).send({ status: false, message: "No data found" });
    return res.status(200).send({
      status: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//============================================================
const deleteShippingAdd = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const addressId = req.params.addressId; //required contactUsId form path params

    // Validate the userID format (should be a valid MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400).send({
        status: false,
        message: "Please provide valid address Id",
      });
    }
    let getID = await addressModel.findById(addressId);
    if (!getID) {
      return res.status(404).send({
        status: false,
        message: "address Id Not Found for the request id",
      });
    }
    if (getID.isDeleted == true) {
      return res.status(404).send({
        status: false,
        message: "address id is already deleted not found",
      });
    }

    await addressModel.updateOne(
      { _id: addressId },
      { isDeleted: true, deletedAt: Date.now() }
    );
    return res.status(200).send({
      status: true,
      message: "address Id is deleted succesfully",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//================================================================================================
const countOfShippingAdd = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    //"Retailer", "Manufacturer"
    let data = await addressModel
      .find({ isDeleted: false })
      .countDocuments();
    res.status(200).send({ status: true, data: data });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//=================================================================================================
const updateShippingAdd = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    const Id = req.params.addressId; //getting the client id from the path params

    let getContactUs = await addressModel.findById(Id);
    if (!getContactUs) {
      return res.status(404).send({
        status: false,
        message: "No address found",
      });
    }

    let addressData = await addressModel.findOneAndUpdate({ _id: Id }, data, {
      new: true,
    });
    if (!addressData) {
      return res.status(404).send({
        status: false,
        message: "No address found",
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: userData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//========================================================================

// const dupesSabooGroupsContactUs = async (req,res)=>{
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   try {
//     const repeatedPhoneNumbers = await addressModel.aggregate([
//       {
//         $group: {
//           _id: {
//             number: "$phone",
//             date: "$date"
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0, // Exclude _id from the result
//           number: "$_id.number",
//           date: "$_id.date",
//           count: 1
//         }
//       },
//       { $match: { count: { $gt: 1 } } }
//     ]);

//     return res.status(200).send({ status: true, data: repeatedPhoneNumbers });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   }
//   //==========================================================================
//   const SabooGroupsUniqueEntries = async (req,res)=>{
//     res.setHeader("Access-Control-Allow-Origin", "*");
//       try {
//         let data = await addressModel.aggregate([
//           { $match: { isDeleted: false } },
//           { $group: { _id: {
//               number: "$phone",
//               date: "$date"
//             }, doc: { $first: "$$ROOT" } } },
//           { $replaceRoot: { newRoot: "$doc" } },
//           { $sort: { createdAt: -1 } },
//         ]);
//         return res.status(200).send({ status: true, data: data });
//       } catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//       }
    
//     }
//     //==================================================================

//     const SabooGroupsRange = async (req, res) => {
//       res.setHeader("Access-Control-Allow-Origin", "*");
//       try {
//         const { startDate, endDate } = req.body; // Assuming startDate and endDate are provided in the request body
    
//         let data = await addressModel.aggregate([
//           {
//             $match: {
//               isDeleted: false,
//               $expr: {
//                 $and: [
//                   { $gte: ["$date", startDate] },
//                   { $lte: ["$date", endDate] }
//                 ]
//               }
//             }
//           },
//           {
//             $group: {
//               _id: {
//                   date: "$date",
//                   mobile: "$phone",
//               },
//               doc: { $first: "$$ROOT" },
//             },
//           },
//           { $replaceRoot: { newRoot: "$doc" } },
//           { $sort: { createdAt: -1 } }, // Note: createdAt field doesn't seem to be in the pipeline
//         ]);
    
//         return res.status(200).send({ status: true, data: data });
//       } catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//       }
//     }

module.exports = {
  createShippingAdd,
  getShippingAdd,
  countOfShippingAdd,
  updateShippingAdd,
  deleteShippingAdd
//   SabooGroupsRange,
//   SabooGroupsUniqueEntries,
//   dupesSabooGroupsContactUs,
};