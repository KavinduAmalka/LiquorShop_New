import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  contactNumber: {type: String, required: true},
  country: {type: String, required: true},
  cartItems:{type: Object, default: {}},
}, {minimize: false})

const User = mongoose.models.user || mongoose.model('user',userSchema)

export default User;