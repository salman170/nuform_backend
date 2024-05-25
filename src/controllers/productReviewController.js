import productReviewModel from "../models/productReviewModel.js";

export const addEditProductReview = async (req, res) => {
    try {
        let data = req.body
        let userPhone = data.userPhone
        if(!data || !userPhone) return res.status(400).send({ status: false, message: "required data is missing" });

        let review  = await productReviewModel.find({isDeleted: false, userPhone: userPhone})
        if(review){
            review.rating = data.rating
            review.comment = data.comment
            saveData.updatedAt = new Date();
            await review.save()
            return res.status(200).send({ status: true, message: review });
        }

        let saveData = productReviewModel.create(data)
        
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
