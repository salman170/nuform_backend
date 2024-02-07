const jwt = require("jsonwebtoken");
const blogModel = require("../model/blogModel");
const authorModel = require("../model/authorModel")
const mongoose = require('mongoose')


const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        //If no token is present in the request header return error. This means the user is not logged in.
        if (!token) {
            return res.status(400).send({ status: false, msg: "token must be present" });
        }
        jwt.verify(token, "FunctionUp Group No 63", (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, message: "token is not valid" })
            }
            req.authorId = decodedToken.authorId
            //Set an attribute in request object 
            next();
        })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
};



const authorization = async function (req, res, next) {
    try {
        if (req.params.blogId) {
            let blogId = req.params.blogId
            if (!mongoose.isValidObjectId(blogId)) { return res.status(400).send({ status: false, msg: "blogId is not in format" }) }
            let authordetails = await blogModel.findById(blogId)
            if (!authordetails) {
                return res.status(400).send({ status: false, msg: "blogId is invalid" })
            }
            if (authordetails.authorId._id.toString() !== req.authorId) {
                return res.status(403).send({ status: false, msg: "You are not authorized" })
            }
            next()
        }
        else if (Object.keys(req.query).length == 0) {
            return res.status(403).send({ Status: false, msg: "You are not authorized provide some details in either in path param or query param" })
        }
        else if (req.query) {
            if (req.query.isPublished === 'true') {
                req.query.isPublished = true
            }
            else if (req.query.isPublished === 'false') {
                req.query.isPublished = false
            }

            if (req.query.authorId) {
                if (!mongoose.isValidObjectId(req.query.authorId)) { return res.status(400).send({ status: false, msg: "authorId is not in format" }) }
                else {
                    if (!await authorModel.findById(req.query.authorId)) {
                        return res.status(400).send({ status: false, msg: "Author id is not valid" })
                    }
                }
            }
            let findauthorid = await blogModel.find(req.query).select({ authorId: 1, _id: 0 })
            if (findauthorid.length == 0) {
                return res.status(400).send({ status: false, msg: "No document found with given filter" })
            }
            else {
                for (let i = 0; i < findauthorid.length; i++) {
                    if (findauthorid[i].authorId._id.toString() == req.authorId) {
                        return next()
                    }
                }
                return res.status(403).send({ Status: false, msg: "You are not authorized" })
            }
        }

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports = { authentication, authorization }