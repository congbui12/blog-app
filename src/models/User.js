import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String, default: undefined },
    resetTokenExpiry: { type: Date, default: undefined }
});

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }

const User = mongoose.model('User', userSchema);
export default User;