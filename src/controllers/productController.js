import ProductModel from "../models/ProductModel.js";

const addProductData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;

    if (!data)
      return res
        .status(400)
        .send({ status: false, message: "product data is missing" });

    let saveData = await ProductModel.create(data);
    res.status(201).send({ status: true, data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getProductData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let filter = { isDeleted: false };
    const productId = req.params.productId;
    if(!productId)  return res.status(400).send({ status: false, message: "No product id passed" });
    filter._id = productId
  
    const productData = await ProductModel.find(filter).sort({ createdAt: -1 });
    if (productData.length === 0)
      return res
        .status(400)
        .send({ status: false, message: "No product found" });
    return res.status(200).send({
      status: true,
      data: productData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const listProductData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

    const productData = await ProductModel.find({ isDeleted: false })
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!productData) {
      return res
        .status(404)
        .send({ status: false, message: "No products found" });
    }
    return res.status(200).send({ status: true, data: productData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateProductData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    let data = req.body;
    const productId = req.params.productId;

    let productData = await ProductModel.findById(productId);
    if (!productData) {
      return res.status(404).send({
        status: false,
        message: "no productData found",
      });
    }

    let updatedData = await ProductModel.findOneAndUpdate(
      { _id: productData },
      data,
      {
        new: true,
      }
    );

    if (!updatedData) {
      return res.status(404).send({
        status: false,
        message: "no product found to update",
      });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: productData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteProductData = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const orderId = req.params.orderId;

    const orderToUpdate = await OrderModel.findById(orderId);
    if (!orderToUpdate) {
      return res.status(404).send({ status: false, message: "Order not found" });
    }

    // Update isDeleted field
    orderToUpdate.isDeleted = true;
    orderToUpdate.deletedAt = new Date();
    await orderToUpdate.save();

    return res.status(200).send({ status: true, message: "Order flagged as deleted" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export { addProductData, getProductData, listProductData ,updateProductData, deleteProductData };
