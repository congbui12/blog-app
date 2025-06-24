import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // confirmToken: { type: String, default: undefined },
    // confirmTokenExpiry: { type: Date, default: undefined },
    // isActivated: { type: Boolean, required: true, default: false },
    // activatedAt: { type: Date, default: undefined },
    resetToken: { type: String, default: undefined },
    resetTokenExpiry: { type: Date, default: undefined },
    // roles: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }

const User = mongoose.model('User', userSchema);
export default User;