import dotenv from "dotenv";
dotenv.config();
import express from "express";
import route from "./routes/route.js";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/", route);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Server started"))
  .catch((e) => console.log("Got error while starting server ", e));

app.listen(process.env.PORT || 8000, function () {
  console.log("Running on " + (process.env.PORT || 8000));
});
