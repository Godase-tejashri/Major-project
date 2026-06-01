const Listing = require("./Models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./Models/review.js");

// 1. Check Login
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to make changes!");
        return res.redirect("/login");
    }
    next();
};

// 2. Save Redirect URL
const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } else {
        res.locals.redirectUrl = "/listings";
    }
    next();
};

// 3. Validate Listing (Joi) - 🟢 FIXED FOR MULTIPART FORM
const validateListing = (req, res, next) => {

    let dataToValidate = req.body.listing ? req.body : { listing: req.body };
    
    let { error } = listingSchema.validate(dataToValidate);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log("Joi Validation Error:", errMsg); 
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 4. Check if User is Listing Owner
const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next(); 
};

// 5. Validate Review (Joi) - 🟢 FIXED FOR REVIEW OBJECT
const validateReview = (req, res, next) => {
    let dataToValidate = req.body.review ? req.body : { review: req.body };

    let { error } = reviewSchema.validate(dataToValidate);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 6. Check if User is Review Author
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this review!");
        return res.redirect(`/listings/${id}`);
    }
    next(); 
};

module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    validateListing,
    isOwner,
    validateReview,
    isReviewAuthor
};