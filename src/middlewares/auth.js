import jwt from "jsonwebtoken";
import AdminModel from "../models/adminModel.js";
import UserModel from "../models/userModel.js";

const authentication = async (req, res, next) => {
    try {

        let authUser;
        if(req?.query?.isAdmin){
            if(!req?.query?.adminId)  return res.status(400).send({ status: false, msg: "Admin Id is not passed" });
            authUser = await AdminModel.findById(req?.query?.adminId)
        }else{
            if(!req?.query?.userId)  return res.status(400).send({ status: false, msg: "User Id is not passed" });
            authUser = await UserModel.findById(req?.query?.userId)
        }

        if(!authUser) return res.status(400).send({ status: false, msg: "User not found" });
        let token = req.headers["x-api-key"];
        if (!token) {
            return res.status(400).send({ status: false, msg: "Token must be present" });
        }
        jwt.verify(token, authUser.loginKey, (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, message: "Token is not valid" });
            }
            req.decodedUserId = decodedToken.userId;
            next();
        });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

const authorization = async (req, res, next) => {
    try {
        let decodedUserId = req.decodedUserId
        let currentId = req.query.userId || req.query.adminId
        if(!currentId)  return res.status(400).send({ status: false, msg: "Id is not passed" });
        if(decodedUserId !== currentId)  return res.status(403).send({ status: false, msg: "Unauthorized" });
        return next()
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

export { authentication, authorization };
