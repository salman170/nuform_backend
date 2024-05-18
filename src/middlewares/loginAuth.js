import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import AdminModel from "../models/adminModel.js";
import UserModel from "../models/userModel.js"
import dotenv from "dotenv";
dotenv.config();

const login = async (req, res) => {
  try {
    const data = req.body;

    const { email, password } = data;

    if (!email || !password) return res.status(400).send({ status: false, message: "Email or password is missing" });

    let loggedInUser;
    if (req?.query?.isAdmin) {
      loggedInUser = await AdminModel.findOne({ email: email });
    } else {
      loggedInUser = await UserModel.findOne({ email: email });
    }
    if (!loggedInUser) return res.status(400).send({ status: false, message: "Please provide correct email" });

    const isValidPass = await bcrypt.compare(password, loggedInUser.password);

    if (!isValidPass) return res.status(401).send({ status: false, message: "Password is not correct" });

    const token = jwt.sign({ userId: loggedInUser._id }, loggedInUser.loginKey, {
      expiresIn: "24h",
    });

    return res.status(200).send({ status: true, message: "Logged in successfully", data: token });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).send({ status: false, message: "Email is missing" });

    let user;
    if (req?.query?.isAdmin) {
      user = await AdminModel.findOne({ email: email });
    } else {
      user = await UserModel.findOne({ email: email });
    }
    if (!user) return res.status(400).send({ status: false, message: "User not found" });

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, user.loginKey, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    req.token = resetToken;
    req.loginKey = loginKey

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Hello,</p><p>You requested a password reset. Click <a href="http://yourdomain.com/reset-password/${resetToken}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({ status: false, message: "Failed to send reset email" });
      }
      return res.status(200).send({ status: true, message: "Reset email sent successfully" });
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
    try {
      const { newPassword, isAdmin } = req.body;
      const { token } = req.token;
  
      if (!token || !newPassword) {
        return res.status(400).send({ status: false, message: "Token or newPassword is missing" });
      }
  
      jwt.verify(token, req.loginKey, (err, decodedToken) => {
        if (err) {
          return res.status(401).send({ status: false, message: "Token is not valid" });
        }
        req.decodedUserId = decodedToken.userId;
      });
     
      // Find the user by ID in the decoded token
      let user;
      if (isAdmin) {
        user = await AdminModel.findById(req.decodedUserId);
      } else {
        user = await UserModel.findById(req.decodedUserId);
      }
  
      if (!user) {
        return res.status(404).send({ status: false, message: "User not found" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user's password in the database
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).send({ status: true, message: "Password reset successful" });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
export { login, forgotPassword, resetPassword};
  

