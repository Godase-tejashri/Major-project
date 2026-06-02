if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const MongoStore = require("connect-mongo");
const User = require("./Models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js"); 
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL;

// ==================== DATABASE CONNECTION ====================
async function main() {
    await mongoose.connect(dburl);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB Connection Error: ", err);
  });

// ==================== CONFIGURATIONS & VIEW ENGINE ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ==================== APPLICATION MIDDLEWARES ====================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Store
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRETE || "mysupersecretcode!",
  },
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("Session Store Error: ", e);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRETE || "mysupersecretcode!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}; 

app.use(session(sessionOptions));
app.use(flash());

// Passport.js Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================== LOCAL VARIABLES MIDDLEWARE ====================
app.use((req, res, next) => {
    res.locals.currUser = req.user; 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ==================== ROUTES ====================
// होम पेज एरर फिक्स करण्यासाठी:
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// ==================== ERROR HANDLING ====================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

module.exports = app;