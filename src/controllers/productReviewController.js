import productReviewModel from "../models/productReviewModel.js";

export const addEditProductReview = async (req, res) => {
    try {
        let data = req.body
        let userEmail = data.userEmail;
        if (!data || !userEmail)
          return res
            .status(400)
            .send({ status: false, message: "required data is missing" });

        let review = await productReviewModel.findOne({
          isDeleted: false,
          userEmail: userEmail,
          product: data.product,
        });
        if(review){
            review.rating = data.rating
            review.comment = data.comment
            review.title = data.title
            review.name = data.name
            review.updatedAt = new Date();
            await review.save()
            return res.status(200).send({ status: true, message: review });
        }

        let saveData = await productReviewModel.create(data)
        
        return res.status(201).send({ status: true, message: saveData });

    }catch(err){
        console.log(err)
        return res.status(500).send({status: false, message: "Internal server error"})
    }
}

export const listProductReview = async (req, res) => {
    try{
        const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

        const reviews = await productReviewModel.find({ isDeleted: false })
          .limit(limit)
          .sort({ createdAt: -1 });
    
        if (!reviews) {
          return res
            .status(404)
            .send({ status: false, message: "No reviews found" });
        }
        return res.status(200).send({ status: true, data: reviews });
    }catch(err){
        console.log(err)
        return res.status(500).send({status: false, message: "Internal server error"})
    }
}

export const getProductReview = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;
    const productId = req.query.productId;

    const reviews = await productReviewModel
      .find({ isDeleted: false, product: productId })
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!reviews) {
      return res
        .status(404)
        .send({ status: false, message: "No reviews found" });
    }

    // Calculate average rating
    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
    });
    const averageRating = Math.round(totalRating / reviews.length);

    return res.status(200).send({ status: true, data: reviews, averageRating });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};