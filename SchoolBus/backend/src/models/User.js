import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'driver', 'user'], default: 'user' }

}, { timestamps: true, });
export const User = mongoose.model("User", userSchema);
export default User;