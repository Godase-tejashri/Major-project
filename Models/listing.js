const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?v=4",
      set: (v) => v === "" ? "https://images.unsplash.com/photo-1501785888041-af3ef285b470?v=4" : v
    },
    filename: {
      type: String,
      default: "listingimage"
    }
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  // category: {
  //   type: String,
  //   required: false
  // }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;