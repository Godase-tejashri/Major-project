const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl } = require("../middleware.js");

//today
module.exports = router;

const userController = require("../controllers/users.js");


router 
.route("/signup")
.get(userController.renderSignupForm)
.post( wrapAsync(userController.signup));


router 
.route("/login")
.get(userController.renderLoginForm)
.post(
  
  saveRedirectUrl, 
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }), 
  userController.login
);

router.get("/logout",userController.logout);

module.exports = router;