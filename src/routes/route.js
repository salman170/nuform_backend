const express = require("express");
const {
  contactform,
  getcontactform,
  deleteContactForm,
  updateContactUs,
} = require("../controllers/contactUsController");
const router = express.Router();

//====================================================================
router.get("/test-me", function (req, res) {
  res.send("this is successfully created");
});

// router.get("/", (req, res) => {
//   res.setHeader("Cache-Control", "no-store");
//   res.status(200).send({ status: true, msg: "Success" });
// });

// router.get('/favicon.ico', (req, res) => {
//   // Return an empty 204 No Content response to prevent the browser from requesting it again.
//   res.status(204).end();
// });

//======================contactform================================
router.post("/contactform", contactform);
router.get("/getcontactform", getcontactform); //by admin
router.delete(
  "/deleteContactForm/:contactUsId/:userID",
  //   authentication,
  //   authorization3,
  deleteContactForm
); // by admin
router.put(
  "/updateContactUs/:contactUsId/:userID",
  //   authentication,
  //   authorization3,
  updateContactUs
);

module.exports = router;
