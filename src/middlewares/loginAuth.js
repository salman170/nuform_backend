import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import AdminModel from "../models/adminModel.js";
import UserModel from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
import { v5 as uuidv5 } from "uuid";
import Mailgen from "mailgen";

const login = async (req, res) => {
  try {
    const data = req.body;

    const { email, password } = data;

    if (!email || !password)
      return res
        .status(400)
        .send({ status: false, message: "Email or password is missing" });

    let loggedInUser;
    if (req?.query?.isAdmin) {
      loggedInUser = await AdminModel.findOne({ email: email });
    } else {
      loggedInUser = await UserModel.findOne({ email: email });
      console.log("loggedInUser", loggedInUser);
    }
    if (!loggedInUser)
      return res
        .status(400)
        .send({ status: false, message: "Please provide correct email" });

    const isValidPass = await bcrypt.compare(password, loggedInUser.password);

    if (!isValidPass)
      return res
        .status(401)
        .send({ status: false, message: "Password is not correct" });

    const token = jwt.sign(
      { userId: loggedInUser._id },
      loggedInUser.loginKey,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).send({
      status: true,
      message: "Logged in successfully",
      data: token,
      userID: loggedInUser._id,
      userType: req.query.isAdmin ? "admin" : "user",
      userName: loggedInUser.name,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Email is missing" });

    let user;
    if (req?.query?.isAdmin) {
      user = await AdminModel.findOne({ email: email });
    } else {
      user = await UserModel.findOne({ email: email });
    }

    if (!user)
      return res.status(400).send({ status: false, message: "User not found" });

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, user.loginKey, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    await UserModel.updateOne({ email: email }, { resetToken: resetToken });

  
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });



    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        logo: "https://nuform.in/static/media/logo.4b69f81166ba17cf1eda.png",
        // Custom logo height
        logoHeight: "60px",
        name: "Nuform",
        link: "https://nuform.in/",
      },
    });
    let response = {
      body: {
        greeting: "Hi",
        name: `${user.name}`,
        intro: [
          // `New User ${costumerData.name} has been registered on our platform. Please take the necessary steps to welcome and onboard the new user.`,
          // "    ",
          // `User Details:`,
          // ` Name:  ${costumerData.name}`,
          // `Email:  ${costumerData.email}`,
          // ` Phone:  ${costumerData.phone}`,
          // ` JobTitle: ${costumerData.jobTitle}`,
          // ` Company: ${costumerData.company}`,
          // "       ",

          `We have received a request to reset your password. Please click the button below to reset your password. If you did not request a password reset, please ignore this email.`,
          `If you're having trouble clicking the "Reset Password" button, then <a href="https://nuform.in/resetpassword/${user.email}/${resetToken}">Click here</a> to reset your password.`,
        
        ],
        //  outro: "To access further details, kindly proceed to log in to the portal.",
        action: {
          instructions: "",
          button: {
            color: "#0916ff", // Optional action button color
            text: `Reset Password`,
            link: `https://nuform.in/resetpassword/${user.email}/${resetToken}`,
          },
        },
        signature: "Best regards",
      },
    };
    let mail = MailGenerator.generate(response);
   
   
    

    transporter.verify(function (error, success) {
      if (error) {
        console.error("Error connecting to email server:", error);
        return res.status(500).send({
          status: false,
          message: "Failed to connect to email server",
        });
      }
      console.log("Server is ready to send emails");
    });

    const mailOptions = {
      from: `Nuform <${process.env.GMAIL_USER}>`,
      to: user.email,
      // subject: ` Nuform - Password Reset Request `,
      subject: "Password Reset Request - Nuform",
      html: mail,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .send({ status: false, message: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
      return res
        .status(200)
        .send({ status: true, message: "Reset email sent successfully" });
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, isAdmin, resetToken, email } = req.body;

    if (!resetToken || !newPassword || !email) {
      return res.status(400).send({
        status: false,
        message: "Token or newPassword or email is missing",
      });
    }

    let userData = await UserModel.findOne({ email: email });

    if (!userData) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    jwt.verify(resetToken, userData.loginKey, (err, decodedToken) => {
      if (err) {
        return res
          .status(401)
          .send({ status: false, message: "Token is not valid" });
      }
      if (userData._id != decodedToken.userId) {
        return res.status(401).send({ status: false, message: "Invalid user" });
      }

      if (userData.resetToken != resetToken) {
        return res
          .status(401)
          .send({ status: false, message: "Invalid token" });
      }

      //check whether the token is expired
      if (Date.now() >= decodedToken.exp * 1000) {
        return res
          .status(401)
          .send({ status: false, message: "Token is expired" });
      }
    });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const namespace = process.env.NAMESPACE; // random string
    const uniqueIdentifier = userData?.phone || userData?.email;
    const uniqueSecretKey = uuidv5(uniqueIdentifier, namespace);
    userData.loginKey = uniqueSecretKey;

    // Update user's password in the database
    userData.password = hashedPassword;
    await userData.save();

    return res
      .status(200)
      .send({ status: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export { login, forgotPassword, resetPassword };
