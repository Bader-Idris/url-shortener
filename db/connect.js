try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
