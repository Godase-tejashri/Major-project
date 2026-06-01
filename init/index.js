const mongoose = require("mongoose");
const initData = require("./data.js");

// Force clean model initialization by clearing Mongoose cache
if (mongoose.models.Listing) {
  delete mongoose.models.Listing;
}

// Define the exact schema matching your data.js structure directly
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?v=4",
    }
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
 
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Listing = mongoose.model("Listing", listingSchema);

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
   
    await Listing.deleteMany({});

  
    const processedData = initData.data.map((obj) => ({
      ...obj,
      owner: "6a117f477557ff6a27c262ea", 
      image: obj.image && obj.image.url ? { url: obj.image.url, filename: "listingimage" } : { url: obj.image, filename: "listingimage" }
    }));


    await Listing.insertMany(processedData);
    console.log("data was initialized successfully! 🎉");

  } catch (err) {
    console.log("Initialization Error:", err);
  } finally {
   
    mongoose.connection.close(); 
    console.log("Database connection closed cleanly.");
  }
};

