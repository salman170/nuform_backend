const express = require("express");
const route = require("./routes/route");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.json());
var cors = require("cors");
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 8000, function () {
  console.log("Express app running on port " + (process.env.PORT || 8000));
});

//version controller new Date()

app.use(function (req, res) {
  var err = new Error("Not Found");
  err.status = 404;
  return res.send({ status: 404, msg: "path not found" });
});
