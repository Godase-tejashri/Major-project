const User = require("../Models/user.js");
const passport = require("passport");

module.exports.renderSignupForm =  (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    
    // Fix: Added next to the wrapper arguments above so it executes safely here
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    if (e.code === 11000 || e.message.includes("email")) {
      req.flash("error", "A user with the given email is already registered!");
    } else {
      req.flash("error", e.message);
    }
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm =  (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login =  async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    
  
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };

  module.exports.logout =   (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};