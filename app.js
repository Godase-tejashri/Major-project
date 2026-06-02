



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
const MongoStore = require("connect-mongo"); // कंसातील (session) काढून टाका
const User = require("./Models/user.js"); // तुमच्या फोल्डरनुसार 'models' किंवा 'Models' तपासा

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js"); 
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";//

// const dburl = process.env.ATLASDB_URL;
const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// ==================== DATABASE CONNECTION ====================
main()
  .then(() => {
    console.log("Connected to DB");
    app.listen(8080, () => {
      console.log("Server is listening on port 8080");
    });
  })
  .catch((err) => {
    console.log("DB Connection Error: ", err);
  });

// async function main() {
//   await mongoose.connect(dburl);
// }

async function main() {
  await mongoose.connect(dburl);
}


// ==================== CONFIGURATIONS & VIEW ENGINE ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ==================== APPLICATION MIDDLEWARES ====================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));



// const store = MongoStore.create({
//   mongoUrl: dburl,
//   touchAfter: 24 * 3600, // 24 hours
//   crypto: {
//     secret: "mysupersecretcode!"
//   }
// });










// const store = MongoStore.create({
//   mongoUrl: "mongodb://127.0.0.1:27017/wanderlust", // थेट लोकल डेटाबेस पाथ
//   touchAfter: 24 * 3600, // 24 hours
//   crypto: {
//     secret: "mysupersecretcode!"
//   }
// });

// store.on("error", function (e) {
//   console.log("Session Store Error: ", e);
// });






const store = MongoStore.default ? MongoStore.default.create({
  mongoUrl: "mongodb://127.0.0.1:27017/wanderlust",
  touchAfter: 24 * 3600,
  crypto: {
    secret: "mysupersecretcode!"
  }
}) : MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/wanderlust",
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SECRETE || "mysupersecretcode!"}
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

// Passport.js Authentication Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================== LOCAL VARIABLES MIDDLEWARE ====================
// इथे आपण सर्व संभाव्य नावे एकत्र सेट करत आहोत जेणेकरून कोणत्याही EJS फाईलमध्ये एरर येणार नाही!
app.use((req, res, next) => {
    // युजरसाठी दोन्ही नावे सेट केली (काही फाईल्समध्ये currUser आहे तर काहींमध्ये currentUser)
    res.locals.currUser = req.user; 
    res.locals.currentUser = req.user; 

    // फ्लॅश मेसेजसाठी दोन्ही नावे सेट केली (success आणि successMsg दोन्ही चालतील)
    const successMessages = req.flash("success");
    const errorMessages = req.flash("error");

    res.locals.success = successMessages;
    res.locals.successMsg = successMessages;
    
    res.locals.error = errorMessages;
    res.locals.errorMsg = errorMessages;

    next();
});

// ==================== CORE APPLICATION ROUTES ====================
// सर्व राऊट्स आता मिडलवेअरच्या खाली आहेत (योग्य क्रम)
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// ==================== ERROR HANDLING ====================

// 404 Catch-All Fallback Route
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
    let statusCode = err.statusCode;
    let message = err.message;

    if (!statusCode || typeof statusCode === "string" || isNaN(statusCode)) {
        statusCode = (message && (message.includes("must be") || message.includes("required"))) ? 400 : 500;
    }

    if (!message) {
        message = "Something went wrong!";
    }

    if (statusCode === 400) {
        req.flash("error", message);
        return res.redirect(req.headers.referer || "/listings");
    }

    res.status(statusCode).render("error.ejs", { statusCode, message });
});

module.exports = app;