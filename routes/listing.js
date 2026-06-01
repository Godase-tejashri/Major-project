const express = require("express");
const router = express.Router();
const Listing = require("../Models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateListing, isOwner } = require("../middleware.js");

const listingsController = require("../controllers/listings.js");

// Multer
const multer = require('multer');
const { storage } = require("../cloudConfig.js"); 
const upload = multer({ storage }); 

// INDEX nd CREATE ROUTE
// (इथे listingsController.index आता आपोआप आपली सर्च क्वेरी हाताळेल!)
router
  .route("/")
  .get(wrapAsync(listingsController.index))
  .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingsController.createListing));

// NEW FORM ROUTE
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// SHOW, UPDATE nd DELETE ROUTE
router
  .route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingsController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

// EDIT FORM ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm)); 

module.exports = router;