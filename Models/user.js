const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let passportLocalMongoose = require("passport-local-mongoose");

// 🛡️ Safety Guard: If it imported as an object by mistake, extract the main function
if (passportLocalMongoose && typeof passportLocalMongoose !== "function" && passportLocalMongoose.default) {
    passportLocalMongoose = passportLocalMongoose.default;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Pass the verified function to the plugin
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);