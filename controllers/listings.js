// const Listing = require("../Models/listing");
// const wrapAsync = require("../utils/wrapAsync");
// const ExpressError = require("../utils/ExpressError.js");

// // 1. INDEX - 
// module.exports.index = async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// };























// // 2. RENDER NEW FORM -
// module.exports.renderNewForm = (req, res) => {
//     res.render("listings/new.ejs");
// };

// // 3. SHOW LISTING - 
// module.exports.showListing = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate({
//         path: "reviews",
//         populate: {
//             path: "author"
//         }
//     }).populate("owner");
    
//     if (!listing) {
//         req.flash("error", "Listing you searched for does not exist!");
//         return res.redirect("/listings");
//     }
//     res.render("listings/show.ejs", { listing });
// };



// module.exports.createListing = async (req, res) => {

//     let listingData = req.body.listing; 
   
//     const newListing = new Listing(listingData);
//     newListing.owner = req.user._id;

    
//     if (req.file) {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         newListing.image = { url, filename };
//     } else {
        
//         newListing.image = { 
//             url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?v=4", 
//             filename: "listingimage" 
//         };
//     }


//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

// // 5. RENDER EDIT FORM -
// module.exports.renderEditForm = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("owner"); 
    
//     if (!listing) {
//         req.flash("error", "Listing you are trying to edit does not exist!");
//         return res.redirect("/listings");
//     }
    
//     if (!listing.owner || !listing.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to edit this listing!");
//         return res.redirect(`/listings/${id}`);
//     }
//     res.render("listings/edit.ejs", { listing });
// };

// // 6. UPDATE LISTING -
// module.exports.updateListing = async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id).populate("owner");

//     if (!listing) {
//         req.flash("error", "Listing does not exist!");
//         return res.redirect("/listings");
//     }
    
//     if (!listing.owner || !listing.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to update this listing!");
//         return res.redirect(`/listings/${id}`);
//     }
    
   
//     let dataToUpdate = req.body.listing ? { ...req.body.listing } : { ...req.body };
    
//     await Listing.findByIdAndUpdate(id, dataToUpdate);
    
//     if (typeof req.file !== "undefined") {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = { url, filename };
//         await listing.save();
//     }
    
//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

// // 7. DESTROY LISTING - 
// module.exports.destroyListing = async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id).populate("owner");
    
//     if (!listing.owner || !listing.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to delete this listing!");
//         return res.redirect(`/listings/${id}`);
//     }
//     await Listing.findByIdAndDelete(id);
//     req.flash("success", "Listing Deleted!");
//     res.redirect("/listings");
// };


// // 🟢 तुमच्या controllers/listings.js मधील सुधारित index फंक्शन
// module.exports.index = async (req, res) => {
//     let { category, search } = req.query;
//     let filter = {};

//     // १. जर कॅटेगरी फिल्टर निवडला असेल
//     if (category) {
//         filter.category = category;
//     }

//     // २. जर युझरने सर्च बारमध्ये काही टाईप करून सर्च केले असेल
//     if (search) {
//         filter.$or = [
//             { title: { $regex: search, $options: "i" } },
//             { country: { $regex: search, $options: "i" } },
//             { location: { $regex: search, $options: "i" } }
//         ];
//     }

//     // फिल्टर वापरून डेटाबेसमधून शोधणे
//     const allListings = await Listing.find(filter);
//     res.render("listings/index.ejs", { allListings });
// };


const Listing = require("../Models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");

// ==========================================================
// 1. INDEX ROUTE - फिल्टर्स आणि सर्च दोन्ही एकत्रित हाताळणे
// ==========================================================
module.exports.index = async (req, res) => {
    let { category, search } = req.query;
    let filter = {};

    // १. जर युझरने कॅटेगरी आयकॉनवर क्लिक केले असेल
    if (category) {
        filter.category = category;
    }

    // २. जर युझरने सर्च बारमध्ये काही टाईप करून 'Search' वर क्लिक केले असेल
    if (search) {
        // 'i' मुळे केस-इन्सेंटिव्ह (Case-insensitive) सर्च होतो
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } }
        ];
    }

    // तयार केलेल्या फिल्टरनुसार MongoDB डेटाबेसमधून डेटा शोधणे
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings });
};

// ==========================================================
// 2. RENDER NEW FORM
// ==========================================================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// ==========================================================
// 3. SHOW LISTING
// ==========================================================
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing you searched for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// ==========================================================
// 4. CREATE LISTING
// ==========================================================
module.exports.createListing = async (req, res) => {
    let listingData = req.body.listing; 
   
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    } else {
        newListing.image = { 
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?v=4", 
            filename: "listingimage" 
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// ==========================================================
// 5. RENDER EDIT FORM
// ==========================================================
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("owner"); 
    
    if (!listing) {
        req.flash("error", "Listing you are trying to edit does not exist!");
        return res.redirect("/listings");
    }
    
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    res.render("listings/edit.ejs", { listing });
};

// ==========================================================
// 6. UPDATE LISTING
// ==========================================================
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to update this listing!");
        return res.redirect(`/listings/${id}`);
    }
    
    let dataToUpdate = req.body.listing ? { ...req.body.listing } : { ...req.body };
    
    await Listing.findByIdAndUpdate(id, dataToUpdate);
    
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// ==========================================================
// 7. DESTROY LISTING
// ==========================================================
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");
    
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this listing!");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};












